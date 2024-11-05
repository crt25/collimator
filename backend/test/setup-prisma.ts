import "@quramy/jest-prisma-node";
import { PrismaClient } from "@prisma/client";
import { promisify } from "util";
import { exec } from "child_process";
import { classes, users } from "test/seed";

async function seedDatabase(prisma: PrismaClient): Promise<void> {
  await Promise.all(
    users.map((user) =>
      prisma.user.upsert({
        where: { id: user.id },
        create: user,
        update: user,
      }),
    ),
  );

  await Promise.all(
    classes.map((klass) =>
      prisma.class.upsert({
        where: { id: klass.id },
        create: klass,
        update: klass,
      }),
    ),
  );
}

async function clearDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRaw`
    DO
    $func$
    BEGIN
      EXECUTE (
        SELECT 'TRUNCATE TABLE ' || string_agg(quote_ident(table_name), ', ') || ' RESTART IDENTITY CASCADE'
        FROM   information_schema.tables
        WHERE  table_schema = 'public'
        AND    table_type = 'BASE TABLE'
      );
    END
    $func$;
  `;
}

beforeAll(async () => {
  await promisify(exec)("npx prisma db push --accept-data-loss");
  const prisma = new PrismaClient();
  await prisma.$connect();
  await clearDatabase(prisma);
  await seedDatabase(prisma);
}, 60000);
