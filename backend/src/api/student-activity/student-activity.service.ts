import { Injectable } from "@nestjs/common";
import { Prisma, Student, StudentActivity } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { TasksService } from "../tasks/tasks.service";

export type SolutionInput = Pick<
  Prisma.SolutionUncheckedCreateInput,
  "data" | "mimeType"
>;

export type AppActivityInput = Omit<
  Prisma.StudentActivityAppUncheckedCreateInput,
  "id" | "data"
> & {
  data: string; // Base64 encoded string
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
  ) {}

  create(
    student: Student,
    activity: StudentActivityInput,
    solution: SolutionInput,
  ): Promise<StudentActivity> {
    const appActivityInput:
      | Prisma.StudentActivityAppCreateNestedOneWithoutStudentActivityInput
      | undefined = activity.appActivity
      ? {
          create: {
            type: activity.appActivity.type,
            data: Buffer.from(activity.appActivity.data, "base64"),
          },
        }
      : undefined;

    const solutionHash = this.tasksService.computeSolutionHash(solution.data);

    const input: Prisma.StudentActivityCreateInput = {
      type: activity.type,
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
    };

    return this.prisma.studentActivity.create({ data: input });
  }
}
