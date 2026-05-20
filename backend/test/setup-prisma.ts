import "@quramy/jest-prisma-node";
import { promisify } from "util";
import { exec } from "child_process";
import { PrismaClient } from "@prisma/client";
import { classes, users } from "test/seed";
import { softDeleteExtension } from "src/prisma/extensions/soft-delete-extension";

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
        AND    table_name != '_prisma_migrations'
      );
    END
    $func$;
  `;
}

beforeAll(async () => {
  // NOTE: A few changes were made in migration scripts to support partial unique indexes.
  // We run the migrations because db push does not apply those changes correctly.
  await promisify(exec)("npx prisma migrate deploy");

  // Provide jest-prisma with a Prisma client that already has our soft-delete
  // extension applied. Each test's transaction client (created by jest-prisma
  // from this client via $transaction) then inherits the extension, so that
  // controllers using PrismaService get the same soft-delete behavior as
  // production while remaining inside the per-test transaction that
  // jest-prisma rolls back between tests.
  const extendedClient = new PrismaClient().$extends(softDeleteExtension);
  jestPrisma.initializeClient(extendedClient);

  const prisma = jestPrisma.originalClient;
  await prisma.$connect();
  await clearDatabase(prisma);
  await seedDatabase(prisma);
}, 60000);
