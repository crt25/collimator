import { INestApplication } from "@nestjs/common";
import { Session, SessionStatus } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

export const createSessionWithId = async (
  app: INestApplication,
  options: {
    id: number;
    classId: number;
    title?: string;
    description?: string;
    isAnonymous?: boolean;
    status?: SessionStatus;
  },
): Promise<Session> => {
  const prisma = app.get(PrismaService);

  return prisma.session.create({
    data: {
      id: options.id,
      title: options.title ?? `Test Session ${options.id}`,
      description: options.description ?? "Test description",
      classId: options.classId,
      status: options.status ?? SessionStatus.CREATED,
      isAnonymous: options.isAnonymous ?? false,
      deletedAt: null,
    },
  });
};

export const createSessions = async (
  app: INestApplication,
  options: {
    count: number;
    startId: number;
    classId: number;
    namePrefix: string;
  },
): Promise<void> => {
  const prisma = app.get(PrismaService);

  const sessionsData = Array.from({ length: options.count }, (_, i) => ({
    id: options.startId + i,
    title: `${options.namePrefix} ${options.startId + i}`,
    description: "Test description",
    classId: options.classId,
    status: SessionStatus.CREATED,
    isAnonymous: false,
    deletedAt: null,
  }));

  await prisma.session.createMany({
    data: sessionsData,
  });
};
