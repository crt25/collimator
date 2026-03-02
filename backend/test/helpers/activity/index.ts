import { INestApplication } from "@nestjs/common";
import { StudentActivity, StudentActivityType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

export const createStudentActivity = async (
  app: INestApplication,
  options: {
    id: number;
    studentId: number;
    sessionId: number;
    taskId: number;
    solutionHash: Buffer;
  },
): Promise<StudentActivity> => {
  const prisma = app.get(PrismaService);

  // Ensure SessionTask exists
  await prisma.sessionTask.upsert({
    where: {
      sessionId_taskId: {
        sessionId: options.sessionId,
        taskId: options.taskId,
      },
    },
    create: { sessionId: options.sessionId, taskId: options.taskId, index: 0 },
    update: {},
  });

  return prisma.studentActivity.create({
    data: {
      id: options.id,
      type: StudentActivityType.TASK_STARTED,
      happenedAt: new Date(),
      studentId: options.studentId,
      sessionId: options.sessionId,
      taskId: options.taskId,
      solutionHash: options.solutionHash,
      deletedAt: null,
    },
  });
};
