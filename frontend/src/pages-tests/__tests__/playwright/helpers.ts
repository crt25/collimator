/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page, Request } from "@playwright/test";
import {
  test as testBase,
  expect as expectBase,
} from "playwright-test-coverage";
import { mockOidcClientId, mockOidcProviderUrl } from "./setup/config";
import pg from "pg";
import {
  buildClientConfig,
  getFreePortAndLock,
  getUrl,
  gracefullyStopBackend,
  killProcessByPid,
  PostgresConfig,
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

export const test = testBase.extend<CrtTestOptions, CrtWorkerOptions>({
  scratchURL: ["", { option: true }],
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
      {
        const client = new pg.Client({
          ...postgresConfig,
          // connect to the default 'postgres' database, not the test template db to avoid concurrency issues
          database: "postgres",
        });

        // create a new database based on the template database
        await client.connect();
        await client.query(`DROP DATABASE IF EXISTS "${uniqueDbName}"`);
        await client.query(
          `CREATE DATABASE "${uniqueDbName}" TEMPLATE "${postgresConfig.database}"`,
        );
        await client.end();
      }

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
        { port: backendPort!, path: "/api-json" },
        { port: frontendPort!, path: "/" },
      ]);

      let error: Error | undefined = undefined;

      await use({
        backendPort,
        frontendPort,
        postgresConfig,
        uniqueDbName,
      }).catch((e) => {
        // suppress errors until after cleanup
        error = e;
      });

      // kill the frontend
      killProcessByPid(frontendProcess.pid);

      // gracefully stop the backend - this is required for coverage output
      await gracefullyStopBackend(backendProcess, backendStopPort);

      // drop the database
      {
        const client = new pg.Client(postgresConfig);
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
      const testFileName = testInfo.titlePath[0];

      // update the last test file name
      setLastTestFileName(testFileName);

      // if we are still in the same test file there is nothing to do
      // also if null, this is the first file so nothing to reset yet.
      if (lastTestFileName === null || testFileName === lastTestFileName) {
        return use(undefined);
      }

      // if we changed the test file, reset the database
      {
        const client = new pg.Client(workerConfig.postgresConfig);
        await client.connect();
        await client.query(
          // drop with force, the db is currently used by the backend.
          `DROP DATABASE IF EXISTS "${workerConfig.uniqueDbName}" WITH (FORCE)`,
        );
        await client.query(
          `CREATE DATABASE "${workerConfig.uniqueDbName}" TEMPLATE "${workerConfig.postgresConfig.database}"`,
        );
        await client.end();
      }

      const anyFingerprint = await getPublicKeyFingerprint(adminUser.publicKey);

      // trigger request that will make backend re-connect to the database
      await waitUntil(
        async () => {
          const response = await fetch(
            `http://localhost:${workerConfig.backendPort}/api/v0/authentication/public-key/${anyFingerprint}`,
          );

          return response.status === 200;
        },
        60,
        300,
      );

      return use(undefined);
    },
    { auto: true, scope: "test", timeout: 10 * 1000 },
  ],

  page: async ({ page }, use) => {
    // ensure we capture page errors
    const errors: string[] = [];

    page.on("pageerror", (exception) => {
      errors.push(exception.message);
    });

    page.addListener("close", () => {
      if (errors.length > 0) {
        console.error("Page errors:");
        console.error(errors);
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
