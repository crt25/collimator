import { Prisma } from "@prisma/client";

export const prismaOptions = (): Prisma.PrismaClientOptions => {
  if (process.env.DEBUG_MODE === "true") {
    return {
      log: [{ emit: "event", level: "query" }] as const,
    };
  }

  return {
    log: ["error"] as const,
  };
};
