import { Page, Request } from "@playwright/test";
import {
  expect as expectBase,
  test as testBase,
} from "playwright-test-coverage";
import pg from "pg";
import { mockOidcClientId, mockOidcProviderUrl } from "./setup/config";
import {
  buildClientConfig,
  getFreePortAndLock,
  getUrl,
  gracefullyStopBackend,
  killProcessByPid,
  PostgresConfig,
  seedE2eDatabase,
  setupBackendPort,
  setupFrontendPort,
  setupProjectNamePrefix,
  startBackend,
  startFrontendWithBackendProxy,
  unlockPort,
  waitUntil,
  waitUntilReachable,
} from "./setup/helpers";
import { adminUser, getPublicKeyFingerprint } from "./setup/seeding/user";

export const isDebug = process.env.DEBUG !== undefined;

export const jsonResponse = {
  status: 200,
  contentType: "application/json",
};

export type CrtTestOptions = {
  apiURL: string;
  scratchURL: string;
  _databaseSeed: undefined;
};

export type CrtWorkerOptions = {
  _setLastTestFileName: {
    setLastTestFileName: (testFileName: string) => void;
    getLastTestFileName: () => string | null;
  };
  workerConfig:
    | {
        frontendPort: number;
        backendPort: number;
      }
    | {
        frontendPort: number;
        backendPort: number;

        postgresConfig: PostgresConfig;
        uniqueDbName: string;
      };
};

export const getItemIdFromTableTestId = (
  testId: string | undefined | null,
): number => {
  if (!testId) {
    throw new Error("testId is required");
  }

  return parseInt(testId.split("-")[1], 10);
};

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
const cloneDatabaseFromTemplate = async (
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

export const test = testBase.extend<CrtTestOptions, CrtWorkerOptions>({
  workerConfig: [
    async ({}, use, testInfo): Promise<void> => {
      if (testInfo.project.name.startsWith(setupProjectNamePrefix)) {
        // we are in a setup project, so just return the setup config.
        // the setup must be performed before we can do the per-test db tests.
        // otherwise the authentication state and the base db state will be missing.
        return use({
          frontendPort: setupFrontendPort,
          backendPort: setupBackendPort,
        });
      }

      const dbUrlRaw = process.env.DATABASE_URL;

      if (!dbUrlRaw) {
        throw new Error("DATABASE_URL is not set");
      }

      const postgresConfig = buildClientConfig(dbUrlRaw);
      const uniqueDbName = `${postgresConfig.database}-clone-${testInfo.workerIndex}`;

      // create a new database based on the template database
      await cloneDatabaseFromTemplate(postgresConfig, uniqueDbName);

      const testConfig = {
        ...postgresConfig,
        database: uniqueDbName,
      };

      const testUrl = getUrl(testConfig);

      // the frontend port must be different from the backend port
      // and we cannot sequentially start them using automatic port allocation
      // because they need to know each other's ports before starting (env vars)
      const backendPort = await getFreePortAndLock();
      const backendStopPort = await getFreePortAndLock(backendPort + 1);
      const frontendPort = await getFreePortAndLock(backendPort + 2);

      if (isDebug) {
        console.log(
          `Using backend http://localhost:${backendPort} (http://localhost:${backendStopPort} to stop) and frontend http://localhost:${frontendPort}`,
        );
      }

      const backendProcess = startBackend({
        databaseUrl: testUrl,
        port: backendPort,
        stopPort: backendStopPort,
        frontendHostname: `http://localhost:${frontendPort}`,
        jwkEndpoint: `${mockOidcProviderUrl}/__oidc__/jwks`,
        userInfoEndpoint: `${mockOidcProviderUrl}/__oidc__/userinfo`,
        clientId: mockOidcClientId,
      });

      if (isDebug) {
        backendProcess.stdout.on("data", (data) => {
          console.log("[backend]", data.toString());
        });
      }

      backendProcess.stderr.on("data", (data) => {
        console.error("[backend]", data.toString());
      });

      if (!backendProcess.pid) {
        throw new Error("Could not start the backend server");
      }

      const frontendProcess = startFrontendWithBackendProxy({
        port: frontendPort,
        backendUrl: `http://localhost:${backendPort}`,
      });

      if (isDebug) {
        frontendProcess.stdout.on("data", (data) => {
          console.log("[frontend]", data.toString());
        });
      }

      frontendProcess.stderr.on("data", (data) => {
        console.error("[frontend]", data.toString());
      });

      if (!frontendProcess.pid) {
        throw new Error("Could not start the frontend server");
      }

      await waitUntilReachable([
        { port: backendPort, path: "/api-json" },
        { port: frontendPort, path: "/" },
      ]);

      let error: Error | undefined = undefined;

      try {
        await use({
          backendPort,
          frontendPort,
          postgresConfig,
          uniqueDbName,
        });
      } catch (e) {
        // suppress errors until after cleanup
        error = e as Error;
      }

      // kill the frontend
      killProcessByPid(frontendProcess.pid);

      // gracefully stop the backend - this is required for coverage output
      await gracefullyStopBackend(backendProcess, backendStopPort);

      // drop the database. Connect to the default 'postgres' database, not the
      // template: a session connected to the template makes any concurrently
      // running CREATE DATABASE ... TEMPLATE of another worker fail with
      // "source database is being accessed by other users".
      {
        const client = new pg.Client({ ...postgresConfig, database: "postgres" });
        await client.connect();
        await client.query(`DROP DATABASE IF EXISTS "${uniqueDbName}"`);
        await client.end();
      }

      unlockPort(backendPort);
      unlockPort(backendStopPort);
      unlockPort(frontendPort);

      if (error) {
        return Promise.reject(error);
      }
    },
    {
      scope: "worker",
      // always run this fixture
      auto: true,
      // ensure the fixture time is not considered test time
      timeout: 120 * 1000,
    },
  ],

  apiURL: async ({ workerConfig }, use) =>
    // since we proxy backend requests via the frontend, the apiUrl also uses the frontend port
    // but only paths starting with /api will be routed to the API
    use(`http://localhost:${workerConfig.frontendPort}`),

  baseURL: async ({ workerConfig }, use) =>
    use(`http://localhost:${workerConfig.frontendPort}`),

  scratchURL: async ({ workerConfig }, use) =>
    use(`http://localhost:${workerConfig.frontendPort}/scratch`),

  _setLastTestFileName: [
    async ({}, use): Promise<void> => {
      let lastTestFileName: string | null = null;

      const setLastTestFileName = (testFileName: string): void => {
        lastTestFileName = testFileName;
      };

      const getLastTestFileName = (): string | null => lastTestFileName;

      await use({
        setLastTestFileName,
        getLastTestFileName,
      });
    },
    { auto: true, scope: "worker" },
  ],

  _databaseSeed: [
    async (
      {
        workerConfig,
        _setLastTestFileName: { getLastTestFileName, setLastTestFileName },
      },
      use,
      testInfo,
    ): Promise<void> => {
      if (!("uniqueDbName" in workerConfig)) {
        // if there is no unique db there is nothing to re-seed
        return use(undefined);
      }

      const lastTestFileName = getLastTestFileName();
      // Key on project + file, not the file alone. Each spec file runs once per
      // project (e.g. "Desktop" and "iPad Mini landscape"). Keying on the file
      // only means that when the two project runs of the same file happen to be
      // scheduled consecutively on the same worker, the second run sees an
      // unchanged file name and SKIPS the reset — inheriting the first run's
      // mutated database (deleted rows, advanced auto-increment sequences). The
      // suite's tests are order-dependent and share module-level ids, so that
      // stale state desyncs them and fails intermittently depending on how
      // Playwright happens to distribute file/project runs across workers.
      const resetKey = `${testInfo.project.name}::${testInfo.titlePath[0]}`;

      // if we are still in the same test file (and project) there is nothing to
      // do. Also if null, this is the first file so nothing to reset yet.
      if (lastTestFileName === null || resetKey === lastTestFileName) {
        setLastTestFileName(resetKey);
        return use(undefined);
      }

      // if we changed the test file, reset the database.
      // Only record the new reset key AFTER the reset succeeded: the clone is
      // dropped before it is re-created, so if the re-create fails (e.g. the
      // template was briefly locked by another worker) and we had already
      // recorded the key, the next test would skip the reset and run against a
      // database that no longer exists — failing every remaining test in this
      // worker. By recording the key last, a failed reset is simply retried by
      // the next test.
      await cloneDatabaseFromTemplate(
        workerConfig.postgresConfig,
        workerConfig.uniqueDbName,
      );

      const resetTestUrl = getUrl({
        ...workerConfig.postgresConfig,
        database: workerConfig.uniqueDbName,
      });

      const seedResult = seedE2eDatabase({ databaseUrl: resetTestUrl });

      if (seedResult.status !== 0) {
        throw new Error(`e2e seed failed: ${seedResult.stderr?.toString()}`);
      }

      const anyFingerprint = await getPublicKeyFingerprint(adminUser.publicKey);

      // trigger request that will make backend re-connect to the database
      await waitUntil(
        async () => {
          try {
            const response = await fetch(
              `http://localhost:${workerConfig.backendPort}/api/v0/authentication/public-key/${anyFingerprint}`,
            );

            return response.status === 200;
          } catch {
            // We know that sometimes network requests can fail here, so we just return false to signal that the condition is not met.
            // This allows waitUntil's retry loop to continue up to maxTries.
            return false;
          }
        },
        60,
        300,
      );

      // the reset fully succeeded — only now record it (see comment above)
      setLastTestFileName(resetKey);

      return use(undefined);
    },
    { auto: true, scope: "test", timeout: 100 * 1000 },
  ],

  page: async ({ page }, use) => {
    // ensure we capture page errors
    const errors: string[] = [];

    page.on("pageerror", (exception) => {
      errors.push(exception.message);
    });

    page.addListener("close", () => {
      if (errors.length > 0) {
        console.error("Page errors:", errors);
      }
    });

    return use(page);
  },
});

export const expect = expectBase;

export const mockUrlResponses = (
  page: Page,
  url: string,
  responses: {
    get: unknown;
    post?: unknown;
    patch?: unknown;
    delete?: unknown;
  },
  onRequest: {
    get?: (request: Request) => void;
    post?: (request: Request) => void;
    patch?: (request: Request) => void;
    delete?: (request: Request) => void;
  },
): Promise<void> =>
  page.route(url, (route) => {
    if (responses.post && route.request().method() === "POST") {
      onRequest.post?.(route.request());

      return route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(responses.post),
      });
    }

    if (responses.patch && route.request().method() === "PATCH") {
      onRequest.patch?.(route.request());

      return route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(responses.patch),
      });
    }

    if (responses.delete && route.request().method() === "DELETE") {
      onRequest.delete?.(route.request());

      return route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(responses.delete),
      });
    }

    onRequest.get?.(route.request());

    return route.fulfill({
      ...jsonResponse,
      body: JSON.stringify(responses.get),
    });
  });
