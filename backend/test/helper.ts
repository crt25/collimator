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
    create: user,
    update: user,
  });

  await prisma.authenticationToken.upsert({
    where: {
      token: userToken,
    },
    create: {
      token: userToken,
      userId: user.id,
      lastUsedAt: new Date(),
    },
    update: {
      userId: user.id,
      studentId: null,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    },
  });
};

export const adminUserToken = "adminUserToken";
