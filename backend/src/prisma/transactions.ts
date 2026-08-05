import { Prisma } from "@prisma/client";
import { PrismaService } from "./prisma.service";
import { PrismaTransactionClient } from "./types";

export const runSerializableTransaction = async <T>(
  prisma: PrismaService,
  callback: (txClient: PrismaTransactionClient) => Promise<T>,
  maxAttempts = 3,
): Promise<T> => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await prisma.$transaction(callback, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      // PostgreSQL can report a concurrent unique insert as P2002 even at
      // serializable isolation. Retrying lets the lookup see the committed row.
      const shouldRetry =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2002" || error.code === "P2034");

      if (!shouldRetry || attempt >= maxAttempts) {
        throw error;
      }
    }
  }
};
