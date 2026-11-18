import { writeFileSync } from "fs";
import {
  consumeStdout,
  resetDatabase,
  seedE2eDatabase,
  setupFrontendPort,
  startBackend,
  startFrontendWithBackendProxy,
  startMockOidcServer,
  waitUntilReachable,
} from "../setup/helpers";
import { isDebug } from "../helpers";
import { traceMark, traceSpan } from "../setup/trace";
import {
  backendPidFile,
  frontendPidFile,
  killE2eSetupProcesses,
  oidcPidFile,
} from "./e2e-testing-config";

const main = async (): Promise<void> => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  traceMark("setup script started");

  // kill existing processes if they are running
  await traceSpan("setup: stop left-over setup processes", () =>
    killE2eSetupProcesses(),
  );

  // add shutdown hook
  process.on("exit", () => {
    killE2eSetupProcesses();
  });

  const backendPort = process.env.BACKEND_PORT;
  const backendStopPort = process.env.BACKEND_STOP_PORT;
  const oidcMockServerPort = process.env.OIDC_MOCK_SERVER_PORT;
  const oidcClientId = process.env.OIDC_CLIENT_ID;

  if (!backendPort || !oidcMockServerPort || !oidcClientId) {
    throw new Error(
      `One of the required environment variables is not set: ${[backendPort, oidcMockServerPort, oidcClientId].join(", ")}`,
    );
  }

  // reset database
  const databaseUrl = process.env.DATABASE_URL;
  const reset = await traceSpan(
    "setup: reset database (prisma migrate reset + seed)",
    () =>
      resetDatabase({
        databaseUrl,
        seedingMode: process.env.SEEDING_MODE,
      }),
  );

  const seedStdOut = reset.stdout.toString("utf-8");

  if (isDebug) {
    console.log(seedStdOut);
  }

  console.log(reset.stderr.toString("utf-8"));

  if (reset.status !== 0) {
    throw new Error("Could not reset the database");
  }

  const seed = await traceSpan("setup: seed (yarn prisma:seed:e2e)", () =>
    seedE2eDatabase({ databaseUrl }),
  );

  if (isDebug) {
    console.log(seed.stdout.toString("utf-8"));
  }

  if (seed.status !== 0) {
    console.error(seed.stderr.toString("utf-8"));
    throw new Error("Could not seed the e2e database");
  }

  // start mock OIDC server
  const oidcProcess = startMockOidcServer({
    port: oidcMockServerPort,
    frontendHostname: process.env.FRONTEND_URL,
    url: process.env.OIDC_MOCK_SERVER_PROXY_URL,
  });

  consumeStdout(oidcProcess, "[oidc-server]");

  oidcProcess.stderr.on("data", (data) => {
    console.error("[oidc-server]", data.toString());
  });

  if (!oidcProcess.pid) {
    throw new Error("Could not start the mock OIDC server");
  }

  writeFileSync(oidcPidFile, oidcProcess.pid.toString(), {
    encoding: "utf-8",
  });

  // start the backend server by running 'yarn start' in the backend folder
  const backendProcess = startBackend({
    databaseUrl: process.env.DATABASE_URL,
    port: backendPort,
    stopPort: backendStopPort,
    frontendHostname: process.env.FRONTEND_URL,
    jwkEndpoint: process.env.OPENID_CONNECT_JWK_ENDPOINT,
    userInfoEndpoint: process.env.OPENID_CONNECT_USERINFO_ENDPOINT,
    clientId: oidcClientId,
  });

  consumeStdout(backendProcess, "[backend]");

  backendProcess.stderr.on("data", (data) => {
    console.error("[backend]", data.toString());
  });

  if (!backendProcess.pid) {
    // print stderr
    throw new Error("Could not start the backend server");
  }

  writeFileSync(backendPidFile, backendProcess.pid.toString(), {
    encoding: "utf-8",
  });

  await waitUntilReachable([
    {
      port: backendPort,
      path: "/api-json",
    },
    {
      port: oidcMockServerPort,
      path: "/user",
    },
  ]);

  const frontendProcess = startFrontendWithBackendProxy({
    port: setupFrontendPort,
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_HOSTNAME,
  });

  consumeStdout(frontendProcess, "[frontend]");

  frontendProcess.stderr.on("data", (data) => {
    console.error("[frontend]", data.toString());
  });

  if (!frontendProcess.pid) {
    // print stderr
    throw new Error("Could not start the frontend server");
  }

  writeFileSync(frontendPidFile, frontendProcess.pid.toString(), {
    encoding: "utf-8",
  });

  traceMark("setup script done (playwright now waits for the frontend)");

  // playwright will wait for the frontend server to be up and running
  // hence, no need to do that here.
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
