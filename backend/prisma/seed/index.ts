import { PrismaClient } from "@prisma/client";
import { match } from "ts-pattern";
import { seedProduction } from "./production";
import { seedEndToEndTesting } from "./e2e";

const DEFAULT_FRONTEND_HOSTNAME = "https://[YourClassMosaicInstance]";
const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_ADMIN_USERNAME = "Admin";

enum SeedingMode {
  production = "production",
  e2e = "e2e",
}

function getAdminConfig(): { email: string; username: string } {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminUsername = process.env.SEED_ADMIN_USERNAME;

  if (!adminEmail || !adminUsername) {
    return {
      email: DEFAULT_ADMIN_EMAIL,
      username: DEFAULT_ADMIN_USERNAME,
    };
  }

  return {
    email: adminEmail,
    username: adminUsername,
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
