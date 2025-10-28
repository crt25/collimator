import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { softDeleteExtension } from "src/api/extensions/softDeleteExtension";
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
    this.$extends(softDeleteExtension);
  }

  async onModuleInit(): Promise<void> {
    // without this, Prisma will connect lazily on its first call to the database.
    await this.$connect();
  }
}
