import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { ApiModule } from "src/api/api.module";

export const getApp = async (): Promise<INestApplication> => {
  const mockPrismaService = {
    provide: PrismaService,
    useValue: jestPrisma.client,
  };

  const mockPrismaModule = {
    module: PrismaModule,
    providers: [mockPrismaService],
    global: true,
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [mockPrismaModule, ApiModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
};
