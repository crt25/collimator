import { randomBytes } from "crypto";
import { AuthenticationProvider, PrismaClient } from "@prisma/client";

export const seedProduction = async (prisma: PrismaClient): Promise<void> => {
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
};
