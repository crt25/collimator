import { INestApplication } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { User } from "@prisma/client";

export const ensureUserExists = async (
  app: INestApplication,
  user: User,
  userToken: string,
): Promise<void> => {
  const prisma = app.get(PrismaService);

  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      ...user,
      deletedAt: null,
    },
    update: {
      ...user,
      deletedAt: null,
    },
  });

  await prisma.authenticationToken.upsert({
    where: {
      token: userToken,
    },
    create: {
      token: userToken,
      userId: user.id,
      lastUsedAt: new Date(),
      deletedAt: null,
    },
    update: {
      userId: user.id,
      studentId: null,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      deletedAt: null,
    },
  });
};

export const ensureSoftDeletedUserExists = async (
  app: INestApplication,
  user: User,
): Promise<void> => {
  const prisma = app.get(PrismaService);
  const now = new Date();

  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      ...user,
      deletedAt: now,
    },
    update: {
      ...user,
      deletedAt: now,
    },
  });
};

export const softDeleteUser = async (
  app: INestApplication,
  userId: number,
): Promise<void> => {
  const prisma = app.get(PrismaService);
  const now = new Date();

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: now },
  });

  await prisma.authenticationToken.updateMany({
    where: { userId },
    data: { deletedAt: now },
  });
};

export const restoreUser = async (
  app: INestApplication,
  userId: number,
): Promise<void> => {
  const prisma = app.get(PrismaService);

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: null },
  });

  await prisma.authenticationToken.updateMany({
    where: { userId },
    data: { deletedAt: null },
  });
};

export const adminUserToken = "adminUserToken";
