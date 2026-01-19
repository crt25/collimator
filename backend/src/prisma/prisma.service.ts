import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import {
  extendedPrismaClient,
  type ExtendedPrismaClient,
} from "./prisma.extension";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private client: ExtendedPrismaClient = extendedPrismaClient;

  async onModuleInit(): Promise<void> {
    // without this, Prisma will connect lazily on its first call to the database.
    await this.client.$connect();
  }
}
