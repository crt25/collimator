import { AuthenticationProvider, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const teacher = await prisma.user.upsert({
    where: {
      uniqueOidcSubPerProvider: {
        oidcSub: "nico@anansi-solutions.net",
        authenticationProvider: AuthenticationProvider.MICROSOFT,
      },
    },
    update: {},
    create: {
      oidcSub: "nico@anansi-solutions.net",
      authenticationProvider: AuthenticationProvider.MICROSOFT,
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
