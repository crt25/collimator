import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  async onModuleInit(): Promise<void> {
    // without this, Prisma will connect lazily on its first call to the database.
    await this.$connect();
  }
}
