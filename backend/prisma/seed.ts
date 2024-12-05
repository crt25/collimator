import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const teacher = await prisma.user.upsert({
    where: { email: "nico@anansi-solutions.net" },
    update: {},
    create: {
      email: "nico@anansi-solutions.net",
      name: "Nico",
      type: "ADMIN",
    },
  });

  console.log(["teacher", teacher]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
