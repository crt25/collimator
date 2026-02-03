import { randomBytes } from "crypto";
import { AuthenticationProvider, PrismaClient } from "@prisma/client";

export const seedProduction = async (
  prisma: PrismaClient,
  email: string,
  username: string,
  frontendHostname: string,
): Promise<void> => {
  const count = await prisma.user.count({
    where: { email },
  });

  if (count >= 1) {
    console.log(`Admin user with email ${email} already exists. Skipping.`);
    return;
  }

  const admin = await prisma.user.create({
    data: {
      email,
      authenticationProvider: AuthenticationProvider.MICROSOFT,
      name: username,
      type: "ADMIN",
    },
  });

  const token = await prisma.registrationToken.create({
    data: {
      token: randomBytes(32).toString("hex"),
      userId: admin.id,
    },
  });

  console.log(`Created admin user with email ${email}.`);
  console.log(
    `Visit the following URL to complete your registration: ${frontendHostname}/login?registrationToken=${token.token}`,
  );
};
