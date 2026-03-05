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
