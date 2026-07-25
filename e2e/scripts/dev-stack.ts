/**
 * Development/testing stack with the mock OIDC provider.
 *
 * Starts the same stack the e2e suite runs against — mock OIDC server,
 * backend, and the static frontend server — but for interactive use in a real
 * browser: no Microsoft account is required, and the seeded test users can be
 * used to explore admin, teacher and student flows.
 *
 * Requires the e2e builds, with the frontend built against the plain-http
 * mock provider: `yarn build:frontend:dev` (instead of the e2e suite's
 * `yarn build:frontend`, which targets the https URL that Playwright
 * intercepts in-page).
 *
 * Differences from the Playwright-managed stack (scripts/e2e-testing.ts):
 * - TWO frontend instances are started (default ports 3210 and 3211) against
 *   the same backend. Browser storage is per-origin, so the second instance
 *   provides an isolated session — e.g. a teacher on one port and a student
 *   on the other, at the same time, in the same browser.
 * - The database is (re)seeded with the e2e fixtures. The active OIDC
 *   identity can be switched at runtime:
 *     curl -X POST http://localhost:3888/user -d '{"oidcSub":"...","email":"...","name":"..."}'
 * - The backend keeps its analysis cron jobs running.
 *
 * Usage: yarn dev:stack (see package.json), or task dev:mock from the repo
 * root. Ports and the database name can be overridden via the environment
 * variables below.
 */
import { spawn } from "child_process";
import pg from "pg";
import {
  resetDatabase,
  seedE2eDatabase,
  startBackend,
  startFrontendWithBackendProxy,
  startMockOidcServer,
  waitUntilReachable,
} from "../setup/helpers";
import { mockOidcClientId, mockOidcProviderPort } from "../setup/config";

const backendPort = parseInt(process.env.BACKEND_PORT ?? "3998", 10);
const backendStopPort = parseInt(process.env.BACKEND_STOP_PORT ?? "9998", 10);
const frontendPortA = parseInt(process.env.FRONTEND_PORT ?? "3210", 10);
const frontendPortB = parseInt(process.env.FRONTEND_PORT_B ?? "3211", 10);

const databaseName = process.env.DEV_STACK_DATABASE ?? "collimator-devmock";
const postgresUrl =
  process.env.DEV_STACK_POSTGRES_URL ??
  "postgresql://postgres:postgres@localhost:5432";

// The stack (re)seeds the database it is pointed at, so refuse to run against
// anything that does not look like a dedicated scratch database.
if (!databaseName.includes("devmock")) {
  throw new Error(
    `Refusing to run against database "${databaseName}": the dev stack resets ` +
      `and reseeds its database. Use a dedicated one containing "devmock".`,
  );
}

const databaseUrl = `${postgresUrl}/${databaseName}?schema=public`;

const ensureDatabaseExists = async (): Promise<void> => {
  const client = new pg.Client(`${postgresUrl}/postgres`);
  await client.connect();

  const existing = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [databaseName],
  );

  if (existing.rowCount === 0) {
    await client.query(`CREATE DATABASE "${databaseName}"`);
    console.log(`Created database ${databaseName}`);
  }

  await client.end();
};

const pipeOutput = (name: string, child: ReturnType<typeof spawn>): void => {
  child.stdout?.on("data", (data: Buffer) =>
    process.stdout.write(`[${name}] ${data.toString()}`),
  );
  child.stderr?.on("data", (data: Buffer) =>
    process.stderr.write(`[${name}] ${data.toString()}`),
  );
};

const main = async (): Promise<void> => {
  await ensureDatabaseExists();

  console.log(`Resetting and seeding database ${databaseName}...`);
  const reset = resetDatabase({ databaseUrl, seedingMode: "e2e" });

  if (reset.status !== 0) {
    console.error(reset.stderr.toString());
    throw new Error("Could not reset the database");
  }

  const seed = seedE2eDatabase({ databaseUrl });

  if (seed.status !== 0) {
    console.error(seed.stderr?.toString());
    throw new Error("Could not seed the e2e users");
  }

  const oidcProcess = startMockOidcServer({
    port: mockOidcProviderPort,
    frontendHostname: `http://localhost:${frontendPortA}`,
  });
  pipeOutput("oidc", oidcProcess);

  const backendProcess = startBackend({
    databaseUrl,
    port: backendPort,
    stopPort: backendStopPort,
    frontendHostname: `http://localhost:${frontendPortA}`,
    jwkEndpoint: `http://localhost:${mockOidcProviderPort}/__oidc__/jwks`,
    userInfoEndpoint: `http://localhost:${mockOidcProviderPort}/__oidc__/userinfo`,
    clientId: mockOidcClientId,
    // keep the analysis cron jobs running so analyses show up while exploring
    disableScheduledTasks: false,
  });
  pipeOutput("backend", backendProcess);

  await waitUntilReachable([
    { port: backendPort, path: "/api-json" },
    { port: mockOidcProviderPort, path: "/user" },
  ]);

  for (const port of [frontendPortA, frontendPortB]) {
    const frontendProcess = startFrontendWithBackendProxy({
      port,
      backendUrl: `http://localhost:${backendPort}`,
    });
    pipeOutput(`frontend:${port}`, frontendProcess);
  }

  await waitUntilReachable([
    { port: frontendPortA, path: "/" },
    { port: frontendPortB, path: "/" },
  ]);

  console.log(`
=========================================================================
 Dev stack is up (mock OIDC — no Microsoft account required)

   Frontend (session A): http://localhost:${frontendPortA}
   Frontend (session B): http://localhost:${frontendPortB}
     (separate origins => separate browser sessions, e.g. teacher + student)

   Backend:              http://localhost:${backendPort}/api-json
   Mock OIDC:            http://localhost:${mockOidcProviderPort}

 Sign in via "login" on the frontend; the mock provider authenticates the
 currently configured identity. Switch it, e.g. to the seeded admin:

   curl -X POST http://localhost:${mockOidcProviderPort}/user \\
        -d '{"oidcSub":"1234","email":"jane@doe.com","name":"Jane Doe"}'

 The seeded admin's key-pair password is "hunter2" (see e2e/setup/seeding).

 Stop with Ctrl+C.
=========================================================================
`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
