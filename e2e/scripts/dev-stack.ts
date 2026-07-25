/**
 * Development/testing stack with the mock OIDC provider.
 *
 * Starts the same stack the e2e suite runs against — mock OIDC server,
 * backend, and the static frontend server — but for interactive use in a real
 * browser: no Microsoft account is required, and the seeded test users can be
 * used to explore admin, teacher and student flows.
 *
 * Differences from the Playwright-managed stack (scripts/e2e-testing.ts):
 * - The browser-facing OIDC endpoints are served over HTTPS on port 3880
 *   (self-signed certificate) because openid-client refuses plain-HTTP
 *   issuers. The e2e suite never needs this: Playwright intercepts those
 *   requests in-page. On first use, open https://localhost:3880/user once and
 *   accept the certificate warning so the frontend's fetches succeed.
 * - TWO frontend instances are started (default ports 3210 and 3211) against
 *   the same backend. Browser storage is per-origin, so the second instance
 *   provides an isolated session — e.g. a teacher on one port and a student
 *   on the other, at the same time, in the same browser.
 * - The database is (re)seeded with the e2e fixtures. The active OIDC
 *   identity can be switched at runtime:
 *     curl -X POST http://localhost:3888/user -d '{"oidcSub":"...","email":"...","name":"..."}'
 *
 * Usage: yarn dev:stack (see package.json), or task dev:mock from the repo
 * root. Ports and the database name can be overridden via the environment
 * variables below.
 */
import { execFileSync, spawn } from "child_process";
import { existsSync, mkdirSync, readFileSync } from "fs";
import https from "https";
import path from "path";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
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

const oidcHttpsPort = parseInt(process.env.OIDC_HTTPS_PORT ?? "3880", 10);
const backendPort = parseInt(process.env.BACKEND_PORT ?? "3998", 10);
const backendStopPort = parseInt(process.env.BACKEND_STOP_PORT ?? "9998", 10);
const frontendPortA = parseInt(process.env.FRONTEND_PORT ?? "3210", 10);
const frontendPortB = parseInt(process.env.FRONTEND_PORT_B ?? "3211", 10);

const databaseName = process.env.DEV_STACK_DATABASE ?? "collimator-devmock";
const postgresUrl =
  process.env.DEV_STACK_POSTGRES_URL ??
  "postgresql://postgres:postgres@localhost:5432";

const certificateDirectory = "playwright/.certs";
const certificateFile = path.join(certificateDirectory, "localhost.crt");
const keyFile = path.join(certificateDirectory, "localhost.key");

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

const ensureCertificate = (): void => {
  if (existsSync(certificateFile) && existsSync(keyFile)) {
    return;
  }

  mkdirSync(certificateDirectory, { recursive: true });

  // openssl ships with git on Windows and is preinstalled on Linux/macOS
  execFileSync("openssl", [
    "req",
    "-x509",
    "-newkey",
    "rsa:2048",
    "-nodes",
    "-keyout",
    keyFile,
    "-out",
    certificateFile,
    "-days",
    "3650",
    "-subj",
    "/CN=localhost",
    "-addext",
    "subjectAltName=DNS:localhost,IP:127.0.0.1",
  ]);

  console.log(`Generated self-signed certificate in ${certificateDirectory}`);
};

/**
 * openid-client refuses plain-HTTP issuers, so the browser-facing OIDC
 * endpoints are exposed through this HTTPS proxy. The x-forwarded-url header
 * makes the mock server advertise the proxy's URL as the issuer.
 */
const startOidcHttpsProxy = (): void => {
  const app = express();

  app.use(
    createProxyMiddleware({
      target: `http://localhost:${mockOidcProviderPort}`,
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq) => {
          // origin only: the mock server uses this as the base URL for the
          // issuer and all advertised endpoints
          proxyReq.setHeader(
            "x-forwarded-url",
            `https://localhost:${oidcHttpsPort}`,
          );
        },
      },
    }),
  );

  https
    .createServer(
      {
        cert: readFileSync(certificateFile),
        key: readFileSync(keyFile),
      },
      app,
    )
    .listen(oidcHttpsPort, () => {
      console.log(
        `OIDC HTTPS proxy listening on https://localhost:${oidcHttpsPort}`,
      );
    });
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
  ensureCertificate();

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
    url: `https://localhost:${oidcHttpsPort}`,
  });
  pipeOutput("oidc", oidcProcess);

  startOidcHttpsProxy();

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
   OIDC HTTPS proxy:     https://localhost:${oidcHttpsPort}

 One-time browser setup: open https://localhost:${oidcHttpsPort}/user and
 accept the self-signed-certificate warning.

 Sign in via "login" on the frontend; the mock provider authenticates the
 currently configured identity (default: seeded admin Jane Doe). Switch it:

   curl -X POST http://localhost:${mockOidcProviderPort}/user \\
        -d '{"oidcSub":"456","email":"richard@feynman.com","name":"Richard Feynman"}'

 Stop with Ctrl+C.
=========================================================================
`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
