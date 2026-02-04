import { Prisma } from "@prisma/client";

export const prismaOptions = (): Prisma.PrismaClientOptions => {
  if (process.env.PRISMA_LOG_LEVEL === "true") {
    return {
      log: [
        {
          emit: "stdout",
          level: "query",
        },
        {
          emit: "stdout",
          level: "error",
        },
        {
          emit: "stdout",
          level: "info",
        },
        {
          emit: "stdout",
          level: "warn",
        },
      ] as const,
    };
  }

  return {
    log: ["error"] as const,
  };
};
