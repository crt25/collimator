import { AuthenticationProvider, PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const count = await prisma.user.count({
    where: { email: "nico@anansi-solutions.net" },
  });
  if (count === 0) {
    const admin = await prisma.user.create({
      data: {
        email: "nico@anansi-solutions.net",
        authenticationProvider: AuthenticationProvider.MICROSOFT,
        name: "Nico",
        type: "ADMIN",
      },
    });

    const token = await prisma.registrationToken.create({
      data: {
        token: randomBytes(32).toString("hex"),
        userId: admin.id,
      },
    });

    console.log(["admin", admin, token.token]);
  }
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
