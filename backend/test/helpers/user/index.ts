import { INestApplication } from "@nestjs/common";
import {
  AuthenticationProvider,
  AuthenticationToken,
  RegistrationToken,
  User,
  UserType,
} from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

export const adminUserToken = "adminUserToken";

export const ensureUserExists = async (
  app: INestApplication,
  user: User,
  userToken: string,
): Promise<void> => {
  const prisma = app.get(PrismaService);

  await prisma.user.upsert({
    where: { id: user.id },
    create: { ...user, deletedAt: null },
    update: { ...user, deletedAt: null },
  });

  // NOTE: Prisma does not let us specify the index predicate in ON CONFLICT
  // PostgreSQL will look for indexes that match the specified columns and will only infer non-partial indexes.
  // Since AuthenticationToken.token only has a partial unique index, we cannot use upsert() here.
  // See here: https://www.postgresql.org/docs/9.6/sql-insert.html#SQL-ON-CONFLICT
  const token = await prisma.authenticationToken.findFirst({
    where: { token: userToken },
  });

  if (token) {
    await prisma.authenticationToken.update({
      where: { id: token.id },
      data: { lastUsedAt: new Date() },
    });
  } else {
    await prisma.authenticationToken.create({
      data: {
        token: userToken,
        userId: user.id,
        lastUsedAt: new Date(),
      },
    });
  }
};

export const createUser = async (
  app: INestApplication,
  options: {
    id: number;
    name?: string;
    email?: string;
    type?: UserType;
    authenticationProvider?: AuthenticationProvider;
  },
): Promise<User> => {
  const prisma = app.get(PrismaService);

  return prisma.user.create({
    data: {
      id: options.id,
      name: options.name ?? `Test User ${options.id}`,
      email: options.email ?? `user${options.id}@test.com`,
      authenticationProvider:
        options.authenticationProvider ?? AuthenticationProvider.MICROSOFT,
      type: options.type ?? UserType.TEACHER,
      deletedAt: null,
    },
  });
};

export const createAuthenticationToken = async (
  app: INestApplication,
  options: {
    id: number;
    userId?: number | null;
    studentId?: number | null;
  },
): Promise<AuthenticationToken> => {
  const prisma = app.get(PrismaService);

  return prisma.authenticationToken.create({
    data: {
      id: options.id,
      token: `token-${options.id}`,
      userId: options.userId ?? null,
      studentId: options.studentId ?? null,
      lastUsedAt: new Date(),
    },
  });
};

export const createRegistrationToken = async (
  app: INestApplication,
  options: {
    id: number;
    userId: number;
  },
): Promise<RegistrationToken> => {
  const prisma = app.get(PrismaService);

  return prisma.registrationToken.create({
    data: {
      id: options.id,
      token: `registration-${options.id}`,
      userId: options.userId,
    },
  });
};
