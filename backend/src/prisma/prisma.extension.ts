import { PrismaClient } from "@prisma/client";
import { softDeleteExtension } from "./extensions/softDeleteExtension";

export const extendedPrismaClient = new PrismaClient().$extends(
  softDeleteExtension,
);

export type ExtendedPrismaClient = typeof extendedPrismaClient;
