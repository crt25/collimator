import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ApiModule } from "src/api/api.module";
import { mockConfigModule } from "src/utilities/test/mock-config.service";
import { CoreModule } from "src/core/core.module";

/**
 * Nest application for e2e tests, wired like production (CoreModule + ApiModule)
 * but with mock config and jest-prisma's transactional Prisma client.
 *
 * PrismaService must be overridden: the real provider builds a client outside
 * jest-prisma's per-test transaction, so soft-deletes would persist across tests.
 * The extension is applied in test/setup-prisma.ts via initializeClient().
 */
export const getApp = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [mockConfigModule, CoreModule, ApiModule],
  })
    .overrideProvider(PrismaService)
    .useFactory({ factory: () => jestPrisma.client })
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  app.enableShutdownHooks();

  return app;
};
