import { INestApplication } from "@nestjs/common";
import {
  AstVersion,
  ReferenceSolution,
  Solution,
  SolutionAnalysis,
  SolutionTest,
  StudentSolution,
  Task,
  TaskType,
} from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

export const createTask = async (
  app: INestApplication,
  options: {
    id: number;
    creatorId: number;
    title?: string;
    description?: string;
    type?: TaskType;
    isPublic?: boolean;
  },
): Promise<Task> => {
  const prisma = app.get(PrismaService);

  return prisma.task.create({
    data: {
      id: options.id,
      title: options.title ?? `Test Task ${options.id}`,
      description: options.description ?? "Test description",
      type: options.type ?? TaskType.SCRATCH,
      data: Buffer.from("test data"),
      mimeType: "application/json",
      creatorId: options.creatorId,
      isPublic: options.isPublic ?? false,
      deletedAt: null,
    },
  });
};

export const createSolution = async (
  app: INestApplication,
  options: {
    taskId: number;
    hash: Buffer;
  },
): Promise<Solution> => {
  const prisma = app.get(PrismaService);

  return prisma.solution.create({
    data: {
      taskId: options.taskId,
      hash: options.hash,
      data: Buffer.from("solution data"),
      mimeType: "application/json",
      deletedAt: null,
    },
  });
};

export const createSolutionAnalysis = async (
  app: INestApplication,
  options: {
    taskId: number;
    solutionHash: Buffer;
  },
): Promise<SolutionAnalysis> => {
  const prisma = app.get(PrismaService);

  return prisma.solutionAnalysis.create({
    data: {
      taskId: options.taskId,
      solutionHash: options.solutionHash,
      genericAst: "{}",
      astVersion: AstVersion.v0,
      deletedAt: null,
    },
  });
};

export const createReferenceSolution = async (
  app: INestApplication,
  options: {
    id: number;
    taskId: number;
    solutionHash: Buffer;
  },
): Promise<ReferenceSolution> => {
  const prisma = app.get(PrismaService);

  return prisma.referenceSolution.create({
    data: {
      id: options.id,
      title: `Reference Solution ${options.id}`,
      description: "Test description",
      taskId: options.taskId,
      solutionHash: options.solutionHash,
      deletedAt: null,
    },
  });
};

export const createStudentSolution = async (
  app: INestApplication,
  options: {
    id: number;
    taskId: number;
    solutionHash: Buffer;
    studentId: number;
    sessionId: number;
  },
): Promise<StudentSolution> => {
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

  return prisma.studentSolution.create({
    data: {
      id: options.id,
      taskId: options.taskId,
      solutionHash: options.solutionHash,
      studentId: options.studentId,
      sessionId: options.sessionId,
      deletedAt: null,
    },
  });
};

export const createSolutionTest = async (
  app: INestApplication,
  options: {
    id: number;
    referenceSolutionId?: number | null;
    studentSolutionId?: number | null;
  },
): Promise<SolutionTest> => {
  const prisma = app.get(PrismaService);

  return prisma.solutionTest.create({
    data: {
      id: options.id,
      name: `Test ${options.id}`,
      passed: true,
      referenceSolutionId: options.referenceSolutionId ?? null,
      studentSolutionId: options.studentSolutionId ?? null,
      deletedAt: null,
    },
  });
};
