import { PrismaClient } from "@prisma/client";
import { createUsers } from "./create-users";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await createUsers(prisma);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
