import pg from "pg";
import { PostgresConfig } from "./helpers";

/**
 * (Re-)creates a worker database as a clone of the template database.
 *
 * Always connects to the default 'postgres' database, never to the template:
 * CREATE DATABASE ... TEMPLATE fails with "source database is being accessed
 * by other users" if any session is connected to the template — so a worker
 * holding a template connection while cloning makes every other worker's clone
 * (and thereby all its remaining tests) fail. The clone itself is additionally
 * serialized across workers with an advisory lock as insurance against
 * concurrent CREATE DATABASE calls copying the same template.
 */
export const cloneDatabaseFromTemplate = async (
  postgresConfig: PostgresConfig,
  uniqueDbName: string,
): Promise<void> => {
  const client = new pg.Client({
    ...postgresConfig,
    database: "postgres",
  });

  await client.connect();
  try {
    // drop with force, the db may still be used by the backend
    await client.query(
      `DROP DATABASE IF EXISTS "${uniqueDbName}" WITH (FORCE)`,
    );
    await client.query(
      "SELECT pg_advisory_lock(hashtext('e2e-template-clone'))",
    );
    try {
      // retry on "source database is being accessed by other users" (55006):
      // even with the advisory lock, a session outside our control (e.g. the
      // setup backend's connection pool) may briefly touch the template.
      const maxAttempts = 5;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await client.query(
            `CREATE DATABASE "${uniqueDbName}" TEMPLATE "${postgresConfig.database}"`,
          );
          break;
        } catch (error) {
          const isObjectInUse =
            error instanceof pg.DatabaseError && error.code === "55006";

          if (!isObjectInUse || attempt === maxAttempts) {
            throw error;
          }

          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    } finally {
      await client.query(
        "SELECT pg_advisory_unlock(hashtext('e2e-template-clone'))",
      );
    }
  } finally {
    await client.end();
  }
};
