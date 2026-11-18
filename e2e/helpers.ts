import { ChildProcessWithoutNullStreams } from "child_process";
import { Page, Request } from "@playwright/test";
import {
  expect as expectBase,
  test as testBase,
} from "playwright-test-coverage";
import pg from "pg";
import { mockOidcClientId, mockOidcProviderUrl } from "./setup/config";
import { cloneDatabaseFromTemplate } from "./setup/database";
import {
  ensureFastStack,
  FastStackState,
  isFastMode,
  resetFastDatabase,
} from "./setup/fast-stack";
import {
  buildClientConfig,
  consumeStdout,
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
import { isTracing, traceDuration, traceEvent, traceSpan } from "./setup/trace";

export const isDebug = process.env.DEBUG !== undefined;

export const jsonResponse = {
  status: 200,
  contentType: "application/json",
};

export type CrtTestOptions = {
  apiURL: string;
  scratchURL: string;
  _databaseSeed: undefined;
  _trace: undefined;
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

        // fast mode: a stack that is kept alive between invocations
        fastStack: FastStackState;
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

// set by the worker fixture on platforms where the backend must be restarted
// after the database has been re-created
let restartWorkerBackend: (() => Promise<void>) | null = null;

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

      if (isFastMode) {
        // re-use (or start) the stack that is kept alive between invocations.
        // Its database is reset here; nothing is torn down afterwards.
        const fastStack = await ensureFastStack();

        return use({
          frontendPort: fastStack.frontendPort,
          backendPort: fastStack.backendPort,
          fastStack,
        });
      }

      const dbUrlRaw = process.env.DATABASE_URL;

      if (!dbUrlRaw) {
        throw new Error("DATABASE_URL is not set");
      }

      const postgresConfig = buildClientConfig(dbUrlRaw);
      const uniqueDbName = `${postgresConfig.database}-clone-${testInfo.workerIndex}`;

      const workerStartedAt = Date.now();

      // create a new database based on the template database
      await traceSpan("worker: clone database", () =>
        cloneDatabaseFromTemplate(postgresConfig, uniqueDbName),
      );

      const testConfig = {
        ...postgresConfig,
        database: uniqueDbName,
      };

      const testUrl = getUrl(testConfig);

      // the frontend port must be different from the backend port
      // and we cannot sequentially start them using automatic port allocation
      // because they need to know each other's ports before starting (env vars)
      const portsStartedAt = Date.now();
      const backendPort = await getFreePortAndLock();
      const backendStopPort = await getFreePortAndLock(backendPort + 1);
      const frontendPort = await getFreePortAndLock(backendPort + 2);
      traceDuration("worker: lock 3 ports", portsStartedAt);

      if (isDebug) {
        console.log(
          `Using backend http://localhost:${backendPort} (http://localhost:${backendStopPort} to stop) and frontend http://localhost:${frontendPort}`,
        );
      }

      const launchBackend = (): ChildProcessWithoutNullStreams => {
        const backend = startBackend({
          databaseUrl: testUrl,
          port: backendPort,
          stopPort: backendStopPort,
          frontendHostname: `http://localhost:${frontendPort}`,
          jwkEndpoint: `${mockOidcProviderUrl}/__oidc__/jwks`,
          userInfoEndpoint: `${mockOidcProviderUrl}/__oidc__/userinfo`,
          clientId: mockOidcClientId,
        });

        consumeStdout(backend, "[backend]");

        backend.stderr.on("data", (data) => {
          console.error("[backend]", data.toString());
        });

        if (!backend.pid) {
          throw new Error("Could not start the backend server");
        }

        return backend;
      };

      let backendProcess = launchBackend();

      // On Windows the graceful shutdown (stop port) does not terminate the
      // backend reliably, so the process tree is killed instead. This means no
      // coverage output for the backend on Windows, which is irrelevant locally.
      const stopBackend = async (): Promise<void> => {
        if (process.platform === "win32") {
          if (backendProcess.pid !== undefined) {
            killProcessByPid(backendProcess.pid);
          }
        } else {
          // gracefully stop the backend - this is required for coverage output
          await gracefullyStopBackend(backendProcess, backendStopPort);
        }
      };

      if (process.platform === "win32") {
        // Dropping the database while the backend is connected leaves dead
        // connections in the backend's pool on Windows (Docker Desktop), which
        // makes later requests hang. Restart the backend after each DB reset.
        restartWorkerBackend = async (): Promise<void> => {
          await stopBackend();
          backendProcess = launchBackend();
          await waitUntilReachable([{ port: backendPort, path: "/api-json" }]);
        };
      }

      const frontendProcess = startFrontendWithBackendProxy({
        port: frontendPort,
        backendUrl: `http://localhost:${backendPort}`,
      });

      consumeStdout(frontendProcess, "[frontend]");

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

      traceDuration("worker: start (total)", workerStartedAt);

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

      const teardownStartedAt = Date.now();

      // kill the frontend
      const killFrontendStartedAt = Date.now();
      killProcessByPid(frontendProcess.pid);
      traceDuration("teardown: kill frontend proxy", killFrontendStartedAt);

      await traceSpan("worker: stop backend", stopBackend);

      // drop the database. Connect to the default 'postgres' database, not the
      // template: a session connected to the template makes any concurrently
      // running CREATE DATABASE ... TEMPLATE of another worker fail with
      // "source database is being accessed by other users".
      {
        const client = new pg.Client({
          ...postgresConfig,
          database: "postgres",
        });
        await traceSpan("teardown: connect to postgres", () =>
          client.connect(),
        );
        const dropStartedAt = Date.now();
        // with force: connections of the stopped backend may still be registered
        await client.query(
          `DROP DATABASE IF EXISTS "${uniqueDbName}" WITH (FORCE)`,
        );
        traceDuration("teardown: drop database", dropStartedAt);
        await client.end();
      }

      traceDuration("worker: teardown (total)", teardownStartedAt);

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
      if ("fastStack" in workerConfig) {
        // same rule as below (reset when the project or test file changes),
        // but restoring a snapshot instead of re-creating the database
        const fastResetKey = `${testInfo.project.name}::${testInfo.titlePath[0]}`;
        const lastFastResetKey = getLastTestFileName();

        if (lastFastResetKey !== null && lastFastResetKey !== fastResetKey) {
          await resetFastDatabase(workerConfig.fastStack);
        }

        setLastTestFileName(fastResetKey);
        return use(undefined);
      }

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
      const resetStartedAt = Date.now();

      await traceSpan("reset: clone database", () =>
        cloneDatabaseFromTemplate(
          workerConfig.postgresConfig,
          workerConfig.uniqueDbName,
        ),
      );

      const resetTestUrl = getUrl({
        ...workerConfig.postgresConfig,
        database: workerConfig.uniqueDbName,
      });

      const seedResult = await traceSpan(
        "reset: seed (yarn prisma:seed:e2e)",
        () => seedE2eDatabase({ databaseUrl: resetTestUrl }),
      );

      if (seedResult.status !== 0) {
        throw new Error(`e2e seed failed: ${seedResult.stderr?.toString()}`);
      }

      if (restartWorkerBackend) {
        await traceSpan("reset: restart backend", restartWorkerBackend);
      }

      const anyFingerprint = await getPublicKeyFingerprint(adminUser.publicKey);
      const reconnectStartedAt = Date.now();

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

      traceDuration("reset: wait for backend", reconnectStartedAt);
      traceDuration("reset: database between files (total)", resetStartedAt);

      // the reset fully succeeded — only now record it (see comment above)
      setLastTestFileName(resetKey);

      return use(undefined);
    },
    { auto: true, scope: "test", timeout: 100 * 1000 },
  ],

  _trace: [
    async ({}, use, testInfo): Promise<void> => {
      const startedAt = Date.now();

      await use(undefined);

      traceDuration(
        "test",
        startedAt,
        `${testInfo.status} | ${testInfo.titlePath.slice(1).join(" › ")}`,
      );
    },
    { auto: true, scope: "test" },
  ],

  page: async ({ page }, use) => {
    if (isTracing) {
      // requests that failed, and requests that never got an answer
      const pending = new Map<Request, number>();

      page.on("request", (request) => pending.set(request, Date.now()));
      page.on("requestfinished", (request) => pending.delete(request));
      page.on("requestfailed", (request) => {
        const startedAt = pending.get(request) ?? Date.now();
        pending.delete(request);

        traceEvent({
          t: startedAt,
          dur: Date.now() - startedAt,
          name: "browser: failed request",
          detail: `${request.method()} ${new URL(request.url()).pathname} (${request.failure()?.errorText})`,
        });
      });
      page.on("close", () => {
        for (const [request, startedAt] of pending) {
          traceEvent({
            t: startedAt,
            dur: Date.now() - startedAt,
            name: "browser: request without answer when the page closed",
            detail: `${request.method()} ${new URL(request.url()).pathname}`,
          });
        }
      });

      // record what the browser waited for: page loads, and any slow request
      page.on("requestfinished", (request) => {
        const timing = request.timing();
        const isDocument = request.resourceType() === "document";

        if (
          timing.responseEnd < 0 ||
          (!isDocument && timing.responseEnd < 300)
        ) {
          return;
        }

        // time until the first byte, i.e. how long the server took to answer
        const serverTime = Math.round(
          timing.responseStart - timing.requestStart,
        );

        traceEvent({
          t: Math.round(timing.startTime),
          dur: Math.round(timing.responseEnd),
          name: isDocument ? "browser: page load" : "browser: slow request",
          detail: `${request.method()} ${new URL(request.url()).pathname} (server ${serverTime}ms)`,
        });
      });
    }

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
