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

  // NOTE: Prisma does not let us specify the index predicate in ON CONFLICT
  // PostgreSQL will look for indexes that match the specified columns and will only infer non-partial indexes.
  // Since AuthenticationToken.token only has a partial unique index, we cannot use upsert() here.
  // See here: https://www.postgresql.org/docs/9.6/sql-insert.html#SQL-ON-CONFLICT
  const token = await prisma.authenticationToken.findFirst({
    where: { token: userToken, deletedAt: null },
  });

  if (token) {
    await prisma.authenticationToken.update({
      where: {
        id: token.id,
      },
      data: {
        lastUsedAt: new Date(),
      },
    });
  } else {
    await prisma.authenticationToken.create({
      data: {
        token: userToken,
        userId: user.id,
        lastUsedAt: new Date(),
        deletedAt: null,
      },
    });
  }
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
