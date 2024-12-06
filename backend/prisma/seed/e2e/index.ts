import { PrismaClient } from "@prisma/client";
import { createUsers } from "./create-users";

export const seedEndToEndTesting = async (
  prisma: PrismaClient,
): Promise<void> => {
  await createUsers(prisma);
};
