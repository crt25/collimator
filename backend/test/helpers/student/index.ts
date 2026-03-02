import { INestApplication } from "@nestjs/common";
import {
  AnonymousStudent,
  AuthenticatedStudent,
  Student,
} from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

export const createStudent = async (
  app: INestApplication,
  options: { id: number },
): Promise<Student> => {
  const prisma = app.get(PrismaService);

  return prisma.student.create({
    data: {
      id: options.id,
      deletedAt: null,
    },
  });
};

export const createAuthenticatedStudent = async (
  app: INestApplication,
  options: {
    studentId: number;
    classId: number;
  },
): Promise<AuthenticatedStudent> => {
  const prisma = app.get(PrismaService);

  return prisma.authenticatedStudent.create({
    data: {
      studentId: options.studentId,
      pseudonym: Buffer.from(`pseudonym-${options.studentId}`),
      classId: options.classId,
      deletedAt: null,
    },
  });
};

export const createAnonymousStudent = async (
  app: INestApplication,
  options: {
    studentId: number;
    sessionId: number;
  },
): Promise<AnonymousStudent> => {
  const prisma = app.get(PrismaService);

  return prisma.anonymousStudent.create({
    data: {
      studentId: options.studentId,
      sessionId: options.sessionId,
      deletedAt: null,
    },
  });
};
