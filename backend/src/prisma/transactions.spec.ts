import { Prisma } from "@prisma/client";
import { PrismaService } from "./prisma.service";
import { runSerializableTransaction } from "./transactions";

const prismaError = (code: string): Prisma.PrismaClientKnownRequestError =>
  new Prisma.PrismaClientKnownRequestError("Transaction failed", {
    code,
    clientVersion: "test",
  });

describe("runSerializableTransaction", () => {
  const callback = jest.fn();
  const transaction = jest.fn();
  const prisma = { $transaction: transaction } as unknown as PrismaService;

  beforeEach(() => {
    callback.mockReset();
    transaction.mockReset();
  });

  it("runs the callback in a serializable transaction", async () => {
    transaction.mockResolvedValue("result");

    await expect(runSerializableTransaction(prisma, callback)).resolves.toBe(
      "result",
    );
    expect(transaction).toHaveBeenCalledWith(callback, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it.each(["P2002", "P2034"])("retries %s errors", async (code) => {
    const error = prismaError(code);
    transaction.mockRejectedValueOnce(error).mockResolvedValue("result");

    await expect(runSerializableTransaction(prisma, callback)).resolves.toBe(
      "result",
    );
    expect(transaction).toHaveBeenCalledTimes(2);
  });

  it("uses three attempts by default", async () => {
    const error = prismaError("P2034");
    transaction.mockRejectedValue(error);

    await expect(runSerializableTransaction(prisma, callback)).rejects.toBe(
      error,
    );
    expect(transaction).toHaveBeenCalledTimes(3);
  });

  it("honors a custom maximum number of attempts", async () => {
    const error = prismaError("P2034");
    transaction.mockRejectedValue(error);

    await expect(runSerializableTransaction(prisma, callback, 2)).rejects.toBe(
      error,
    );
    expect(transaction).toHaveBeenCalledTimes(2);
  });

  it("does not retry other errors", async () => {
    const error = new Error("Transaction failed");
    transaction.mockRejectedValue(error);

    await expect(runSerializableTransaction(prisma, callback)).rejects.toBe(
      error,
    );
    expect(transaction).toHaveBeenCalledTimes(1);
  });
});
