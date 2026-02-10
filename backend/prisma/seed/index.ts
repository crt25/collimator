import { PrismaClient } from "@prisma/client";
import { match } from "ts-pattern";
import { seedProduction } from "./production";
import { seedEndToEndTesting } from "./e2e";

const DEFAULT_FRONTEND_HOSTNAME = "https://[YourClassMosaicInstance]";

enum SeedingMode {
  production = "production",
  e2e = "e2e",
}

function getAdminConfig(): { email: string; username: string } {
  return {
    email: process.env.SEED_ADMIN_EMAIL ?? "admin@example.com",
    username: process.env.SEED_ADMIN_USERNAME ?? "Admin",
  };
}

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const mode = (process.env.SEEDING_MODE ??
    SeedingMode.production) as SeedingMode;
  const frontendHostname = (process.env.FRONTEND_HOSTNAME ??
    DEFAULT_FRONTEND_HOSTNAME) as string;

  await match(mode)
    .with(SeedingMode.production, async () => {
      const options = getAdminConfig();
      return seedProduction(
        prisma,
        options.email,
        options.username,
        frontendHostname,
      );
    })
    .with(SeedingMode.e2e, () => seedEndToEndTesting(prisma))
    .exhaustive();
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
