import { PrismaClient } from "@prisma/client";
import { getAdminConfig, DEFAULT_FRONTEND_HOSTNAME } from "../shared/config";
import { seedProduction } from "./production";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const frontendHostname =
    process.env.FRONTEND_HOSTNAME ?? DEFAULT_FRONTEND_HOSTNAME;

  const { email, username } = getAdminConfig();

  await seedProduction(prisma, email, username, frontendHostname);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
