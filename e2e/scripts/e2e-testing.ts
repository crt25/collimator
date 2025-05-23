import { writeFileSync } from "fs";
import {
  resetDatabase,
  setupFrontendPort,
  startBackend,
  startFrontendWithBackendProxy,
  startMockOidcServer,
  waitUntilReachable,
} from "../setup/helpers";
import { isDebug } from "../helpers";
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

  // kill existing processes if they are running
  await killE2eSetupProcesses();

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
  const reset = resetDatabase({
    databaseUrl: process.env.DATABASE_URL,
    seedingMode: process.env.SEEDING_MODE,
  });

  const seedStdOut = reset.stdout.toString("utf-8");

  if (isDebug) {
    console.log(seedStdOut);
  }

  console.log(reset.stderr.toString("utf-8"));

  if (reset.status !== 0) {
    throw new Error("Could not reset the database");
  }

  // start mock OIDC server
  const oidcProcess = startMockOidcServer({
    port: oidcMockServerPort,
    frontendHostname: process.env.FRONTEND_URL,
    url: process.env.OIDC_MOCK_SERVER_PROXY_URL,
  });

  if (isDebug) {
    oidcProcess.stdout.on("data", (data) => {
      console.log("[oidc-server]", data.toString());
    });
  }

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

  if (isDebug) {
    backendProcess.stdout.on("data", (data) => {
      console.log("[backend]", data.toString());
    });
  }

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

  if (isDebug) {
    frontendProcess.stdout.on("data", (data) => {
      console.log("[frontend]", data.toString());
    });
  }

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

  // playwright will wait for the frontend server to be up and running
  // hence, no need to do that here.
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
