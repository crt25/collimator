import {
  ChildProcessWithoutNullStreams,
  spawn,
  spawnSync,
  SpawnSyncReturns,
} from "child_process";
import path from "path";
import { getPortPromise } from "portfinder";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import os from "os";
import { isDebug } from "../helpers";

export type PostgresConfig = {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
};

export const portLockDirectory = "playwright/.port";

export const setupBackendPort = 3999;
export const setupBackendShutdownPort = 9999;
export const setupFrontendPort = 3000;
export const setupProjectNamePrefix = "setup:";

export const getBackendPath = (): string => {
  const segments = process.cwd().split(path.sep);
  const e2eIdx = segments.lastIndexOf("e2e");

  if (e2eIdx === -1) {
    throw new Error("Could not find e2e segment in path");
  }

  // construct the path to the backend folder - can be obtained by replacing the last 'e2e' segment with 'backend'
  return [...segments.slice(0, e2eIdx), "backend"].join(path.sep);
};

export const getFrontendPath = (): string => {
  const segments = process.cwd().split(path.sep);
  const e2eIdx = segments.lastIndexOf("e2e");

  if (e2eIdx === -1) {
    throw new Error("Could not find e2e segment in path");
  }

  return [...segments.slice(0, e2eIdx), "frontend"].join(path.sep);
};

export const getE2EPath = (): string => {
  const segments = process.cwd().split(path.sep);
  const e2eIdx = segments.lastIndexOf("e2e");

  if (e2eIdx === -1) {
    throw new Error("Could not find e2e segment in path");
  }

  return segments.slice(0, e2eIdx + 1).join(path.sep);
};

export const resetDatabase = (config: {
  seedingMode?: string;
  databaseUrl: string;
}): SpawnSyncReturns<Buffer> =>
  spawnSync("yarn", ["prisma:migrate", "reset", "--force"], {
    env: {
      NODE_ENV: "production",
      SEEDING_MODE: config.seedingMode,
      DATABASE_URL: config.databaseUrl,
    },
    cwd: getBackendPath(),
    // since we want 'yarn' to be used from the PATH, we need to set shell to true
    // also not a security problem since we are not using any user input, this is a test script
    shell: true,
  });

export const startMockOidcServer = (config: {
  port?: number | string;
  frontendHostname?: string;
  url?: string;
}): ChildProcessWithoutNullStreams =>
  spawn("yarn", ["start:mock-oidc"], {
    env: {
      NODE_ENV: "production",
      PORT: config.port?.toString(),
      FRONTEND_HOSTNAME: config.frontendHostname,
      // set the proxy URL s.t. the issuer URL is what the frontend expects
      URL: config.url,
    },
    cwd: getE2EPath(),
    shell: true,
  });

export const startBackend = (config: {
  databaseUrl?: string;
  port?: number | string;
  stopPort?: number | string;
  frontendHostname?: string;
  jwkEndpoint?: string;
  userInfoEndpoint?: string;
  clientId?: string;
}): ChildProcessWithoutNullStreams =>
  spawn("yarn", ["start:built:coverage"], {
    env: {
      NODE_ENV: "production",
      DATABASE_URL: config.databaseUrl,
      PORT: config.port?.toString(),
      STOP_PORT: config.stopPort?.toString(),
      FRONTEND_HOSTNAME: config.frontendHostname,
      OPEN_ID_CONNECT_JWK_ENDPOINT: config.jwkEndpoint,
      OPEN_ID_CONNECT_USERINFO_ENDPOINT: config.userInfoEndpoint,
      OPEN_ID_CONNECT_MICROSOFT_CLIENT_ID: config.clientId,
    },
    cwd: getBackendPath(),
    shell: true,
  });

export const buildFrontend = (
  config: {
    backendHostname?: string;
    oidcUrl?: string;
    oidcClientId?: string;
  },
  stdout: "pipe" | "ignore",
  stderr: "pipe" | "ignore",
): void => {
  spawnSync("yarn", ["build:coverage"], {
    env: {
      NODE_ENV: "production",
      NEXT_PUBLIC_BACKEND_HOSTNAME: config.backendHostname,
      NEXT_PUBLIC_OPEN_ID_CONNECT_MICROSOFT_SERVER: config.oidcUrl,
      NEXT_PUBLIC_OPEN_ID_CONNECT_MICROSOFT_CLIENT_ID: config.oidcClientId,
      NEXT_PUBLIC_SCRATCH_APP_HOSTNAME: "http://localhost:3101/scratch",
    },
    cwd: getFrontendPath(),
    shell: true,
    stdio: ["ignore", stdout, stderr],
  });
};

export const startFrontendWithBackendProxy = (config: {
  port?: number | string;
  backendUrl?: string;
}): ChildProcessWithoutNullStreams =>
  spawn("yarn", ["start:frontend"], {
    env: {
      NODE_ENV: "development",
      PORT: config.port?.toString(),
      BACKEND_URL: config.backendUrl,
    },
    cwd: getE2EPath(),
    shell: true,
  });

export const buildClientConfig = (postgresUrl: string): PostgresConfig => {
  const dbUrl = new URL(postgresUrl);

  return {
    user: dbUrl.username,
    password: dbUrl.password,
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port, 10),
    database: dbUrl.pathname.slice(1),
  };
};

export const getUrl = (config: PostgresConfig): string =>
  `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}?schema=public`;

export const killProcessByPid = (pid: number): void => {
  if (!isNaN(pid)) {
    if (os.platform() === "win32") {
      spawnSync("taskkill", ["/pid", pid.toString(), "/f", "/t"]);
    } else {
      process.kill(pid, "SIGKILL");
    }

    if (isDebug) {
      console.log(`Killed process ${pid}`);
    }
  } else {
    throw new Error(`Invalid PID ${pid} `);
  }
};

export const killProcess = (pidFile: string): void =>
  killProcessByPid(parseInt(readFileSync(pidFile, "utf-8"), 10));

export const triggerBackendGracefulShutdown = async (
  stopPort: number,
): Promise<void> => {
  await fetch(`http://localhost:${stopPort}`);
};

export const gracefullyStopBackend = async (
  backendProcess: ChildProcessWithoutNullStreams,
  stopPort: number,
): Promise<void> =>
  new Promise((resolve) => {
    // resolve the promise once the process exists
    backendProcess.on("close", resolve);

    // trigger the stop and wait for it to terminate
    triggerBackendGracefulShutdown(stopPort);
  });

export const waitForProcessToStop = (
  pid: number,
  maxTries = 60,
  timeoutMs = 1000,
): Promise<void> =>
  waitUntil(
    async () => {
      // some black magic - https://stackoverflow.com/a/21296291/2897827
      try {
        process.kill(pid, 0);
        return true;
      } catch {
        return false;
      }
    },
    maxTries,
    timeoutMs,
  );

export const waitUntil = async (
  condition: () => Promise<boolean>,
  maxTries = 60,
  timeoutMs = 1000,
): Promise<void> => {
  let tries = 0;
  let isConditionMet = false;

  do {
    isConditionMet = await condition();
    tries++;

    if (tries > maxTries) {
      throw new Error("Condition was not met within the time limit");
    }

    await new Promise((resolve) => setTimeout(resolve, timeoutMs));
  } while (!isConditionMet);
};

export const waitUntilReachable = async (
  servers: {
    port: string | number;
    path: string;
    protocol?: string;
  }[],
  maxTries = 60,
  timeoutMs = 1000,
): Promise<void> => {
  const areReachable = new Array(servers.length).fill(false);

  return waitUntil(
    async () => {
      await Promise.all(
        servers.map(async (server, index): Promise<void> => {
          try {
            const response = await fetch(
              `${server.protocol ?? "http"}://localhost:${server.port}${server.path}`,
            );

            if (response.ok) {
              areReachable[index] = true;
            }
          } catch {
            // ignore exceptions
          }
        }),
      );

      return areReachable.every((reachable) => reachable);
    },
    maxTries,
    timeoutMs,
  );
};

export const getFreePortAndLock = async (
  minimumPort?: number,
): Promise<number> => {
  let port = await getPortPromise({
    port: minimumPort,
  });

  await waitUntil(async () => {
    try {
      const file = path.join(portLockDirectory, port.toString());
      writeFileSync(file, "", {
        // fail if file already exists
        flag: "wx",
      });

      return true;
    } catch {
      port = await getPortPromise({
        // try another port
        port: port + 1,
      });
    }

    return false;
  });

  return port;
};

export const unlockPort = async (port: number): Promise<void> => {
  const file = path.join(portLockDirectory, port.toString());
  unlinkSync(file);
};
