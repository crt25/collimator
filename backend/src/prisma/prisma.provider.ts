import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { softDeleteExtension } from "./extensions/softDeleteExtension";

@Injectable()
export class PrismaProvider
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private static initialized = false;

  async onModuleInit(): Promise<void> {
    if (!PrismaProvider.initialized) {
      PrismaProvider.initialized = true;
      // without this, Prisma will connect lazily on its first call to the database.
      await this.$connect();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (PrismaProvider.initialized) {
      PrismaProvider.initialized = false;
      await this.$disconnect();
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  withExtensions() {
    return this.$extends(softDeleteExtension);
  }
}
