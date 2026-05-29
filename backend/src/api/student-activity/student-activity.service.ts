import { Injectable } from "@nestjs/common";
import { AstVersion, Prisma, Student, StudentActivity } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { TasksService } from "../tasks/tasks.service";
import { SolutionAnalysisService } from "../solutions/solution-analysis.service";

const latestAstVersion = AstVersion.v1;

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
  "solutionHash" | "appActivity" | "studentId"
> & {
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
    const results = await this.prisma.$transaction(
      activityWithSolution.map(({ activity, solution }) =>
        this.prisma.studentActivity.create({
          data: this.buildActivityInput(student, activity, solution),
          include: { solution: true },
        }),
      ),
    );

    results.forEach((result) =>
      // do not wait for the promise to resolve
      // this will happen in the background
      this.analysisService.performAnalysis(result.solution, latestAstVersion),
    );

    return results;
  }

  async create(
    student: Student,
    activity: StudentActivityInput,
    solution: SolutionInput,
  ): Promise<StudentActivity> {
    const result = await this.prisma.studentActivity.create({
      data: this.buildActivityInput(student, activity, solution),
      include: { solution: true },
    });

    // do not wait for the promise to resolve
    // this will happen in the background
    this.analysisService.performAnalysis(result.solution, latestAstVersion);

    return result;
  }

  private buildActivityInput(
    student: Student,
    activity: StudentActivityInput,
    solution: SolutionInput,
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

    const solutionHash = this.tasksService.computeSolutionHash(solution.data);

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
}
