import { PrismaClient } from "@prisma/client";
import { match } from "ts-pattern";
import * as yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { seedProduction } from "./production";
import { seedEndToEndTesting } from "./e2e";

enum SeedingMode {
  production = "production",
  e2e = "e2e",
}

async function parseArgs(): Promise<{ email: string; username: string }> {
  const args = await yargs(hideBin(process.argv))
    .option("email", {
      type: "string",
      demandOption: true,
      description: "Admin user email",
    })
    .option("username", {
      type: "string",
      demandOption: true,
      description: "Admin username",
    })
    .parse();

  return {
    email: args.email,
    username: args.username,
  };
}

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const mode = (process.env.SEEDING_MODE ??
    SeedingMode.production) as SeedingMode;
  const frontendHostname = process.env.FRONTEND_HOSTNAME as string;

  await match(mode)
    .with(SeedingMode.production, async () => {
      const options = await parseArgs();
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
