import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { ApiModule } from "src/api/api.module";
import { mockConfigModule } from "src/utilities/test/mock-config.service";
import { AuthorizationModule } from "src/api/authorization/authorization.module";
import { AuthenticationModule } from "src/api/authentication/authentication.module";
import { CoreModule } from "src/core/core.module";
import { AuthorizationService } from "src/api/authorization/authorization.service";
import { AuthenticationController } from "src/api/authentication/authentication.controller";
import { AuthenticationService } from "src/api/authentication/authentication.service";
import { APP_GUARD } from "@nestjs/core";
import { RoleGuard } from "src/api/authentication/role.guard";
import { AuthenticationGateway } from "src/api/authentication/authentication.gateway";
import { ConfigModule } from "@nestjs/config";
import { User } from "@prisma/client";

export const getApp = async (): Promise<INestApplication> => {
  const mockPrismaService = {
    provide: PrismaService,
    useValue: jestPrisma.client,
  };

  const mockPrismaModule = {
    module: PrismaModule,
    providers: [mockPrismaService],
    exports: [mockPrismaService],
  };

  const mockAuthorizationModule = {
    module: AuthorizationModule,
    imports: [mockPrismaModule],
    providers: [AuthorizationService],
    exports: [AuthorizationService],
  };

  const mockAuthenticationModule = {
    module: AuthenticationModule,
    imports: [PrismaModule, ConfigModule, AuthorizationModule],
    controllers: [AuthenticationController],
    providers: [
      AuthenticationService,
      {
        // by default, the AdminGuard will be used to protect all routes
        provide: APP_GUARD,
        useClass: RoleGuard,
      },
      AuthenticationGateway,
    ],
    exports: [AuthenticationService],
  };

  const mockCoreModule = {
    module: CoreModule,
    imports: [
      mockPrismaModule,
      mockAuthorizationModule,
      mockAuthenticationModule,
    ],
    exports: [
      mockPrismaModule,
      mockAuthorizationModule,
      mockAuthenticationModule,
    ],
    global: true,
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [mockConfigModule, mockCoreModule, ApiModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  app.enableShutdownHooks();

  return app;
};

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

export const softDeleteStudent = async (
  app: INestApplication,
  studentId: number,
): Promise<void> => {
  const prisma = app.get(PrismaService);
  const now = new Date();

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      authenticatedStudent: true,
      anonymousStudent: true,
    },
  });

  if (!student) {
    throw new Error(`Student with id ${studentId} not found`);
  }

  if (student.authenticatedStudent) {
    await prisma.authenticatedStudent.update({
      where: { studentId: student.authenticatedStudent.studentId },
      data: { deletedAt: now },
    });
  }

  if (student.anonymousStudent) {
    await prisma.anonymousStudent.update({
      where: { studentId: student.anonymousStudent.studentId },
      data: { deletedAt: now },
    });
  }

  await prisma.student.update({
    where: { id: studentId },
    data: { deletedAt: now },
  });

  await prisma.authenticationToken.updateMany({
    where: { studentId },
    data: { deletedAt: now },
  });
};

export const adminUserToken = "adminUserToken";
