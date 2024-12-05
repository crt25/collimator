import { PrismaClient } from "@prisma/client";
import { match } from "ts-pattern";
import { seedProduction } from "./production";
import { seedEndToEndTesting } from "./e2e";

enum SeedingMode {
  production = "production",
  e2e = "e2e",
}

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const mode = (process.env.SEEDING_MODE ||
    SeedingMode.production) as SeedingMode;

  const seedFn = match(mode)
    .with(SeedingMode.production, () => seedProduction)
    .with(SeedingMode.e2e, () => seedEndToEndTesting)
    .exhaustive();

  return seedFn(prisma);
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
