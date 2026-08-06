import { isDeepStrictEqual } from "node:util";
import { ConflictException, Injectable } from "@nestjs/common";
import { AstVersion, Prisma, Student, StudentActivity } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { TasksService } from "../tasks/tasks.service";
import { SolutionAnalysisService } from "../solutions/solution-analysis.service";

const latestAstVersion = AstVersion.v1;
const activityCreateAttempts = 2;

export type StudentActivityWithSolution = Prisma.StudentActivityGetPayload<{
  include: { appActivity: true; solution: true };
}>;

export type SolutionInput = Pick<
  Prisma.SolutionUncheckedCreateInput,
  "data" | "mimeType"
>;

export type AppActivityInput = Omit<
  Prisma.StudentActivityAppUncheckedCreateInput,
  "id" | "data"
> & {
  data: Prisma.InputJsonValue; // JSON data
};

export type StudentActivityInput = Omit<
  Prisma.StudentActivityUncheckedCreateInput,
  "solutionHash" | "appActivity" | "studentId" | "happenedAtCounter"
> & {
  happenedAtCounter: number;
  appActivity: AppActivityInput | null;
};

@Injectable()
export class StudentActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
    private readonly analysisService: SolutionAnalysisService,
  ) {}

  async createMany(
    student: Student,
    activityWithSolution: {
      activity: StudentActivityInput;
      solution: SolutionInput;
    }[],
  ): Promise<StudentActivity[]> {
    const results: StudentActivity[] = [];

    for (const { activity, solution } of activityWithSolution) {
      results.push(await this.create(student, activity, solution));
    }

    return results;
  }

  async create(
    student: Student,
    activity: StudentActivityInput,
    solution: SolutionInput,
  ): Promise<StudentActivity> {
    const solutionHash = this.tasksService.computeSolutionHash(solution.data);
    const data = this.buildActivityInput(
      student,
      activity,
      solution,
      solutionHash,
    );

    for (let attempt = 1; ; attempt++) {
      try {
        const result = await this.prisma.studentActivity.create({
          data,
          include: { solution: true },
        });

        // do not wait for the promise to resolve
        // this will happen in the background
        this.analysisService.performAnalysis(result.solution, latestAstVersion);

        return result;
      } catch (error) {
        if (
          !(
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          )
        ) {
          throw error;
        }

        // the client may replay an activity after a timeout, reload, or concurrent requests
        // treat the activity's unique key as an idempotency key
        // look it up to ensure that an unrelated unique violation is not suppressed
        const existingActivity = await this.prisma.studentActivity.findUnique({
          where: {
            uniqueStudentActivityPerTypeAndTime: {
              studentId: student.id,
              type: activity.type,
              happenedAt: activity.happenedAt,
              happenedAtCounter: activity.happenedAtCounter,
            },
          },
          include: { appActivity: true, solution: true },
        });

        if (existingActivity) {
          if (
            !this.isExactReplay(
              existingActivity,
              activity,
              solution,
              solutionHash,
            )
          ) {
            throw new ConflictException(
              "The activity idempotency key is already used by a different activity",
            );
          }

          return existingActivity;
        }

        // connectOrCreate can race when another request creates the same solution
        // once that request commits, one retry can connect to the solution instead
        if (attempt === activityCreateAttempts) {
          throw error;
        }
      }
    }
  }

  private buildActivityInput(
    student: Student,
    activity: StudentActivityInput,
    solution: SolutionInput,
    solutionHash: Uint8Array,
  ): Prisma.StudentActivityCreateInput {
    const appActivityInput:
      | Prisma.StudentActivityAppCreateNestedOneWithoutStudentActivityInput
      | undefined = activity.appActivity
      ? {
          create: {
            type: activity.appActivity.type,
            data: activity.appActivity.data,
          },
        }
      : undefined;

    return {
      type: activity.type,
      happenedAt: activity.happenedAt,
      happenedAtCounter: activity.happenedAtCounter,
      appActivity: appActivityInput,
      student: {
        connect: { id: student.id },
      },
      session: {
        connect: { id: activity.sessionId },
      },
      task: {
        connect: { id: activity.taskId },
      },
      sessionTask: {
        connect: {
          sessionId_taskId: {
            sessionId: activity.sessionId,
            taskId: activity.taskId,
          },
        },
      },
      solution: {
        connectOrCreate: {
          where: {
            taskId_hash: {
              taskId: activity.taskId,
              hash: solutionHash,
            },
          },
          create: {
            taskId: activity.taskId,
            hash: solutionHash,
            data: solution.data,
            mimeType: solution.mimeType,
          },
        },
      },
    } satisfies Prisma.StudentActivityCreateInput;
  }

  private isExactReplay(
    existing: StudentActivityWithSolution,
    activity: StudentActivityInput,
    solution: SolutionInput,
    solutionHash: Uint8Array,
  ): boolean {
    const appActivityMatches =
      existing.appActivity === null && activity.appActivity === null
        ? true
        : existing.appActivity !== null && activity.appActivity !== null
          ? existing.appActivity.type === activity.appActivity.type &&
            isDeepStrictEqual(
              existing.appActivity.data,
              activity.appActivity.data,
            )
          : false;

    return (
      existing.sessionId === activity.sessionId &&
      existing.taskId === activity.taskId &&
      Buffer.from(existing.solutionHash).equals(Buffer.from(solutionHash)) &&
      existing.solution.mimeType === solution.mimeType &&
      appActivityMatches
    );
  }
}
