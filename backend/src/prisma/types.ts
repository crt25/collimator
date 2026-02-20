import { PrismaService } from "./prisma.service";

// When using Prisma extensions with client.$extends(), the transaction callback
// receives a client type that excludes certain top-level methods like $use, $transaction, etc.
// This type matches both the extended PrismaService and transaction clients by only
// requiring the model access methods we actually need, and not the full TransactionClient interface.
export type PrismaTransactionClient = Omit<
  PrismaService,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;
