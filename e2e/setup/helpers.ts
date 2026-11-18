import {
  ChildProcessWithoutNullStreams,
  spawn,
  spawnSync,
  SpawnSyncReturns,
} from "child_process";
import path from "path";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import os from "os";
import { getPortPromise } from "portfinder";
import { isDebug } from "../helpers";
import { mockOidcClientId, mockOidcProxyUrl } from "./config";
import { traceDuration } from "./trace";

export type PostgresConfig = {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
};

export enum CrtApp {
  scratch = "scratch",
  jupyter = "jupyter",
}

export const portLockDirectory = "playwright/.port";

export const setupBackendPort = 3999;
export const setupBackendShutdownPort = 9999;
export const setupFrontendPort = 3000;
export const setupProjectNamePrefix = "setup:";

// port of the Next.js dev server shared by all workers (frontend mode "dev")
export const frontendDevServerPort = 3990;
export const frontendDevServerUrl = `http://localhost:${frontendDevServerPort}`;

/**
 * How the frontend is served during the e2e tests:
 * - "build" (default): a static production build (with coverage
 *   instrumentation) that has to be re-built before each run.
 * - "dev" (E2E_FRONTEND=dev): a Next.js dev server compiling pages on demand,
 *   so no build is needed and source changes are picked up immediately. It
 *   collects no frontend coverage, and a full parallel run is slower than
 *   against the build (pages are several times heavier to load), so it is
 *   only worth it when iterating on a few tests.
 */
export type FrontendMode = "build" | "dev";

export const getFrontendMode = (): FrontendMode => {
  const mode = process.env.E2E_FRONTEND ?? "build";

  if (mode !== "build" && mode !== "dev") {
    throw new Error(`Invalid E2E_FRONTEND '${mode}', use 'build' or 'dev'`);
  }

  return mode;
};

/**
 * Environment variables baked into the frontend, for a build or a dev server.
 */
export const getFrontendEnv = (config: {
  backendHostname?: string;
  oidcUrl?: string;
  oidcClientId?: string;
}): Record<string, string | undefined> => ({
  NEXT_PUBLIC_BACKEND_HOSTNAME: config.backendHostname,
  NEXT_PUBLIC_OPEN_ID_CONNECT_MICROSOFT_SERVER: config.oidcUrl,
  NEXT_PUBLIC_OPEN_ID_CONNECT_MICROSOFT_CLIENT_ID: config.oidcClientId,
  LOG_LEVEL: "false",
  NEXT_PUBLIC_SCRATCH_APP_HOSTNAME: "/scratch",
  NEXT_PUBLIC_JUPYTER_APP_HOSTNAME: "/jupyter/lab/index.html",
});

export const frontendDevServerCommand = `yarn next dev -p ${frontendDevServerPort}`;

export const getFrontendDevServerEnv = (): Record<string, string> =>
  ({
    ...process.env,
    NODE_ENV: "development",
    NODE_OPTIONS: [process.env.NODE_OPTIONS, "--preserve-symlinks"]
      .filter(Boolean)
      .join(" "),
    ...getFrontendEnv({
      // use a relative path s.t. all workers can share the dev server
      backendHostname: "",
      oidcUrl: mockOidcProxyUrl,
      oidcClientId: mockOidcClientId,
    }),
  }) as Record<string, string>;

/**
 * Reads the standard output of a child process, printing it in debug mode.
 *
 * The output must be read even when it is not printed: a pipe that nobody
 * reads fills up, and the child then blocks on its next write. A backend that
 * logs its database queries reaches that point within a few tests and stops
 * answering requests, which shows up as tests timing out at random places.
 */
export const consumeStdout = (
  child: ChildProcessWithoutNullStreams,
  label: string,
): void => {
  child.stdout.on("data", (data) => {
    if (isDebug) {
      console.log(label, data.toString());
    }
  });
};

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

export const getAppPath = (app: CrtApp): string => {
  const segments = process.cwd().split(path.sep);
  const e2eIdx = segments.lastIndexOf("e2e");

  if (e2eIdx === -1) {
    throw new Error("Could not find e2e segment in path");
  }

  return [...segments.slice(0, e2eIdx), "apps", app].join(path.sep);
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
      ...process.env,
      NODE_ENV: "production",
      SEEDING_MODE: config.seedingMode,
      DATABASE_URL: config.databaseUrl,
    },
    cwd: getBackendPath(),
    // since we want 'yarn' to be used from the PATH, we need to set shell to true
    // also not a security problem since we are not using any user input, this is a test script
    shell: true,
  });

export const seedE2eDatabase = (config: {
  databaseUrl: string;
}): SpawnSyncReturns<Buffer> =>
  spawnSync("yarn", ["prisma:seed:e2e"], {
    env: {
      ...process.env,
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
      ...process.env,
      NODE_ENV: "production",
      PORT: config.port?.toString(),
      FRONTEND_HOSTNAME: config.frontendHostname,
      // set the proxy URL s.t. the issuer URL is what the frontend expects
      URL: config.url,
    },
    cwd: getE2EPath(),
    shell: true,
  });

export type BackendConfig = {
  databaseUrl?: string;
  port?: number | string;
  stopPort?: number | string;
  frontendHostname?: string;
  jwkEndpoint?: string;
  userInfoEndpoint?: string;
  clientId?: string;
};

export const getBackendEnv = (config: BackendConfig): NodeJS.ProcessEnv => ({
  ...process.env,
  NODE_ENV: "production",
  DATABASE_URL: config.databaseUrl,
  PORT: config.port?.toString(),
  // Disable the analysis cron jobs during e2e. They query the DB every
  // minute and collide with the per-test database reset (dropped WITH
  // (FORCE)), causing P1017 connection errors and page-load hangs.
  DISABLE_SCHEDULED_TASKS: "true",
  // only log errors to reduce overhead in test execution
  LOG_LEVEL: "false",
  STOP_PORT: config.stopPort?.toString(),
  FRONTEND_HOSTNAME: config.frontendHostname,
  OPEN_ID_CONNECT_JWK_ENDPOINT: config.jwkEndpoint,
  OPEN_ID_CONNECT_USERINFO_ENDPOINT: config.userInfoEndpoint,
  OPEN_ID_CONNECT_MICROSOFT_CLIENT_ID: config.clientId,
});

export const startBackend = (
  config: BackendConfig,
): ChildProcessWithoutNullStreams => {
  // On Windows, `yarn start:built:coverage` with shell:true creates a chain of
  // cmd.exe -> yarn -> cmd.exe -> c8 -> cmd.exe -> node processes. Killing or
  // waiting for the root of that chain is unreliable (orphans keep stdio pipes
  // open so 'close' never fires). Run c8 directly through node instead.
  const c8Bin = path.join(
    getBackendPath(),
    "node_modules",
    "c8",
    "bin",
    "c8.js",
  );
  const useDirectC8 = os.platform() === "win32" && existsSync(c8Bin);

  const [command, args, useShell] = useDirectC8
    ? [
        process.execPath,
        [
          c8Bin,
          "--report-dir=coverage-e2e",
          process.execPath,
          "./dist/main.js",
        ],
        false,
      ]
    : ["yarn", ["start:built:coverage"], true];

  const backendProcess = spawn(command, args, {
    env: getBackendEnv(config),
    cwd: getBackendPath(),
    shell: useShell,
  });

  return backendProcess;
};

export const buildFrontend = (
  config: {
    backendHostname?: string;
    oidcUrl?: string;
    oidcClientId?: string;
  },
  stdout: "pipe" | "ignore" = "pipe",
  stderr: "pipe" | "ignore" = "pipe",
): void => {
  spawnSync("yarn", ["build:coverage"], {
    env: {
      ...process.env,
      NODE_ENV: "production",
      ...getFrontendEnv(config),
    },
    cwd: getFrontendPath(),
    shell: true,
    stdio: ["ignore", stdout, stderr],
  });
};

export const buildApp = (
  app: CrtApp,
  stdout: "pipe" | "ignore" = "pipe",
  stderr: "pipe" | "ignore" = "pipe",
): void => {
  const isScratch = app === CrtApp.scratch;
  // the jupyter app is built through its Taskfile (there is no Makefile anymore)
  const command = isScratch ? "yarn" : "task";

  const result = spawnSync(command, ["build"], {
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
    cwd: getAppPath(app),
    shell: true,
    stdio: ["ignore", stdout, stderr],
    // the build tools print more than the default of 1MB, at which point the
    // build would be killed
    maxBuffer: 256 * 1024 * 1024,
  });

  // do not continue silently with a stale (or missing) build
  if (result.error || result.status !== 0) {
    throw new Error(
      `Building the ${app} app failed (${command} build, exit code ${result.status}):\n${result.error?.message ?? ""}\n${result.stderr?.toString() ?? ""}`,
    );
  }
};

export const startFrontendWithBackendProxy = (config: {
  port?: number | string;
  backendUrl?: string;
}): ChildProcessWithoutNullStreams =>
  spawn("yarn", ["start:frontend"], {
    env: {
      ...process.env,
      NODE_ENV: "development",
      PORT: config.port?.toString(),
      BACKEND_URL: config.backendUrl,
      // in dev mode pages are forwarded to the dev server instead of being
      // served from the static build
      FRONTEND_DEV_URL:
        getFrontendMode() === "dev" ? frontendDevServerUrl : undefined,
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

/**
 * Kills a process. On Windows this always includes its child processes. On
 * other platforms the whole process group is killed if 'group' is set, which
 * requires that the process was started detached (as leader of its group).
 */
export const killProcessByPid = (pid: number, group = false): void => {
  if (!isNaN(pid)) {
    if (os.platform() === "win32") {
      spawnSync("taskkill", ["/pid", pid.toString(), "/f", "/t"]);
    } else {
      try {
        process.kill(group ? -pid : pid, "SIGKILL");
      } catch {
        // process already exited
      }
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
  timeoutMs = 30_000,
): Promise<void> => {
  await new Promise<void>((resolve) => {
    let done = false;
    const finish = (): void => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve();
      }
    };

    // 'exit' fires when the process ends even if (orphaned) children still hold
    // the stdio pipes open, which would delay or prevent 'close'.
    backendProcess.once("exit", finish);
    backendProcess.once("close", finish);

    // do not wait forever for a backend that does not stop
    const timer = setTimeout(() => {
      console.warn(
        `Backend did not stop within ${timeoutMs}ms after graceful shutdown, killing it.`,
      );
      finish();
    }, timeoutMs);

    // trigger the stop and wait for it to terminate
    triggerBackendGracefulShutdown(stopPort).catch(() => {
      // the stop server may already be gone, fall through to the timeout/exit
    });
  });

  // make sure nothing is left behind (no-op if everything already exited)
  if (backendProcess.pid !== undefined && backendProcess.exitCode === null) {
    try {
      killProcessByPid(backendProcess.pid);
    } catch {
      // already gone
    }
  }
};

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
  for (let tries = 1; ; tries++) {
    // return as soon as the condition is met, only wait between attempts
    if (await condition()) {
      return;
    }

    if (tries >= maxTries) {
      throw new Error("Condition was not met within the time limit");
    }

    await new Promise((resolve) => setTimeout(resolve, timeoutMs));
  }
};

export const waitUntilReachable = async (
  servers: {
    port: string | number;
    path: string;
    protocol?: string;
  }[],
  // Keep the interval at a second or more: polling every 200ms made Node
  // processes that had just spawned servers crash on Windows (exit code
  // 3221226505).
  maxTries = 120,
  timeoutMs = 1000,
): Promise<void> => {
  const areReachable = new Array(servers.length).fill(false);
  const startedAt = Date.now();

  return waitUntil(
    async () => {
      await Promise.all(
        servers.map(async (server, index): Promise<void> => {
          try {
            const response = await fetch(
              `${server.protocol ?? "http"}://localhost:${server.port}${server.path}`,
            );

            if (response.ok && !areReachable[index]) {
              areReachable[index] = true;
              traceDuration(
                "wait until server is reachable",
                startedAt,
                `${server.path} on :${server.port}`,
              );
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

  await waitUntil(
    async () => {
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
    },
    // Workers start at the same time and compete for the same ports, so a
    // collision is the normal case: retry right away instead of waiting.
    1000,
    10,
  );

  return port;
};

export const unlockPort = async (port: number): Promise<void> => {
  const file = path.join(portLockDirectory, port.toString());
  unlinkSync(file);
};
