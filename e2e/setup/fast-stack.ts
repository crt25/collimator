/**
 * Keep-alive stack for fast, repeated runs of single e2e tests (E2E_FAST=true).
 *
 * The regular suite starts a backend and a frontend per Playwright worker and
 * drops/clones the database between test files, which costs ~20s per
 * invocation. In fast mode one backend, one frontend proxy and one database
 * stay alive between invocations ("stack"). Resetting the database is done by
 * restoring a snapshot kept in a separate schema of the same database, so the
 * backend's connections stay valid and nothing has to be restarted.
 *
 * Several stacks can run side by side (e.g. one per agent): each E2E_SLOT has
 * its own ports and database.
 *
 * Prerequisite: the template database and the stored authentication state
 * must exist, i.e. the regular setup must have run once (`yarn test:nobuild`).
 */
import { spawn, spawnSync } from "child_process";
import { createRequire } from "module";
import net from "net";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import os from "os";
import path from "path";
import pg from "pg";
import { isDebug } from "../helpers";
import {
  fastStackBasePort,
  fastStackLogLabel,
  fastStackPortsPerSlot,
  mockOidcClientId,
  mockOidcProviderUrl,
} from "./config";
import { FastSlotInUseError, FastStackError } from "./errors";
import { cloneDatabaseFromTemplate } from "./database";
import {
  buildClientConfig,
  getBackendEnv,
  getBackendPath,
  getE2EPath,
  getUrl,
  killProcessByPid,
  PostgresConfig,
} from "./helpers";

export const isFastMode = process.env.E2E_FAST === "true";

const pristineSchema = "e2e_pristine";
const sequencesTable = "__sequences";

const debug = (message: string): void => {
  if (isDebug) {
    console.log(fastStackLogLabel, message);
  }
};

export type FastStackState = {
  slot: number;
  backendPort: number;
  frontendPort: number;
  backendPid: number;
  frontendPid: number;
  database: string;
  // when the processes were started, used to recognise them later on
  startedAt: number;
  // used to detect that the stack no longer matches what is on disk
  backendBuildTime: number;
  templateTime: number;
};

export const getFastSlot = (): number => {
  const slot = parseInt(process.env.E2E_SLOT ?? "0", 10);

  if (isNaN(slot) || slot < 0) {
    throw new FastStackError(`Invalid E2E_SLOT '${process.env.E2E_SLOT}'`);
  }

  return slot;
};

const getStateDirectory = (): string =>
  path.join(getE2EPath(), "playwright", ".fast");

const getStateFile = (slot: number): string =>
  path.join(getStateDirectory(), `slot-${slot}.json`);

const getLockFile = (slot: number): string =>
  path.join(getStateDirectory(), `slot-${slot}.lock`);

// the tsx command line interface, to run TypeScript scripts with plain node
const getTsxCli = (): string =>
  createRequire(path.join(getE2EPath(), "package.json")).resolve("tsx/cli");

const getAdminAuthFile = (): string =>
  path.join(getE2EPath(), "playwright", ".auth", "admin.json");

const getTemplateConfig = (): PostgresConfig => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new FastStackError("DATABASE_URL is not set");
  }

  return buildClientConfig(dbUrl);
};

const readState = (slot: number): FastStackState | null => {
  try {
    return JSON.parse(readFileSync(getStateFile(slot), "utf-8"));
  } catch {
    return null;
  }
};

const getNewestModificationTime = (directory: string): number => {
  let newest = 0;

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    const time = entry.isDirectory()
      ? getNewestModificationTime(entryPath)
      : statSync(entryPath).mtimeMs;

    newest = Math.max(newest, time);
  }

  return newest;
};

const getBackendBuildTime = (): number => {
  const dist = path.join(getBackendPath(), "dist");

  if (!existsSync(dist)) {
    throw new FastStackError(
      `The backend is not built (${dist} is missing). Run 'yarn build:backend' first.`,
    );
  }

  return getNewestModificationTime(dist);
};

// the authentication state is re-written whenever the regular setup runs, which
// is also when the template database is re-created
const getTemplateTime = (): number => {
  const authFile = getAdminAuthFile();

  if (!existsSync(authFile)) {
    throw new FastStackError(
      `No stored authentication state (${authFile}). Run the regular setup once ('yarn test:nobuild') before using fast mode.`,
    );
  }

  return statSync(authFile).mtimeMs;
};

const isReachable = async (port: number, urlPath: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:${port}${urlPath}`, {
      signal: AbortSignal.timeout(2000),
    });

    return response.ok;
  } catch {
    return false;
  }
};

const waitUntilStackReachable = async (
  backendPort: number,
  frontendPort: number,
  // generous: a backend can take minutes to boot on a busy machine
  timeoutMs = 180_000,
): Promise<void> => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const [backend, frontend] = await Promise.all([
      isReachable(backendPort, "/api-json"),
      isReachable(frontendPort, "/"),
    ]);

    if (backend && frontend) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new FastStackError(
    `The fast stack did not become reachable within ${timeoutMs}ms, see the logs in ${getStateDirectory()}`,
  );
};

const isPortFree = (port: number): Promise<boolean> =>
  new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port);
  });

const isProcessAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // EPERM: the process exists but belongs to someone else
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
};

const getProcessStartTime = (pid: number): number | null => {
  const result =
    os.platform() === "win32"
      ? spawnSync(
          "powershell.exe",
          [
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            `(Get-Process -Id ${pid}).StartTime.ToUniversalTime().ToString('o')`,
          ],
          { windowsHide: true },
        )
      : spawnSync("ps", ["-o", "lstart=", "-p", pid.toString()], {
          env: { ...process.env, LC_ALL: "C" },
        });

  const time = Date.parse(result.stdout?.toString().trim() ?? "");

  return result.status === 0 && !isNaN(time) ? time : null;
};

/**
 * Whether the process with the given id is the one the stack started.
 *
 * The state file can outlive its processes (reboot, crash), and the operating
 * system re-uses process ids. A process that re-uses the id was necessarily
 * started after the stack, so it is told apart by its start time.
 */
const isStackProcess = (pid: number, state: FastStackState): boolean => {
  const startTime = getProcessStartTime(pid);

  // 'ps' reports whole seconds
  return startTime !== null && startTime <= state.startedAt + 1000;
};

// the process holding the slot, or null if the slot is free
const getSlotLockHolder = (slot: number): number | null => {
  try {
    const pid = parseInt(readFileSync(getLockFile(slot), "utf-8"), 10);

    return !isNaN(pid) && isProcessAlive(pid) ? pid : null;
  } catch {
    return null;
  }
};

/**
 * Reserves the slot for this process until it exits, so that two runs cannot
 * restart the stack or reset the database under each other.
 */
export const lockFastSlot = async (slot = getFastSlot()): Promise<void> => {
  mkdirSync(getStateDirectory(), { recursive: true });
  const lockFile = getLockFile(slot);

  // a previous worker of the same run may still be exiting
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      writeFileSync(lockFile, process.pid.toString(), { flag: "wx" });
      process.once("exit", () => rmSync(lockFile, { force: true }));
      return;
    } catch {
      const holder = getSlotLockHolder(slot);

      if (holder === null) {
        // left behind by a process that no longer exists
        rmSync(lockFile, { force: true });
      } else if (holder === process.pid) {
        return;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  throw new FastSlotInUseError(
    slot,
    getSlotLockHolder(slot),
    `Use another E2E_SLOT, or delete ${lockFile} if that process is not a test run.`,
  );
};

// set for the start script launched by the run that holds the slot
const lockHolderVariable = "E2E_FAST_LOCK_HOLDER";

const assertSlotIsNotInUse = (slot: number): void => {
  const holder = getSlotLockHolder(slot);

  if (
    holder !== null &&
    holder !== process.pid &&
    holder.toString() !== process.env[lockHolderVariable]
  ) {
    throw new FastSlotInUseError(
      slot,
      holder,
      "It belongs to a test run and is left alone.",
    );
  }
};

const spawnDetached = (
  args: string[],
  options: { cwd: string; env: NodeJS.ProcessEnv; logFile: string },
): number => {
  if (os.platform() === "win32") {
    // On Windows a child process inherits all inheritable handles of its
    // parent, including the output pipes of whatever started the test run.
    // A process that outlives the run would keep those pipes open, so the
    // caller (e.g. `yarn test:fast | tee log`) would never see the end of the
    // output. Start-Process launches through the shell, which does not
    // inherit handles.
    const quote = (value: string): string => `"${value}"`;
    const command = `${[process.execPath, ...args].map(quote).join(" ")} > ${quote(options.logFile)} 2>&1`;

    const result = spawnSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "(Start-Process -FilePath $env:ComSpec -ArgumentList ('/d /s /c \"' + $env:E2E_FAST_COMMAND + '\"') -WorkingDirectory $env:E2E_FAST_CWD -WindowStyle Hidden -PassThru).Id",
      ],
      {
        env: {
          ...options.env,
          E2E_FAST_COMMAND: command,
          E2E_FAST_CWD: options.cwd,
        },
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      },
    );

    const pid = parseInt(result.stdout?.toString().trim() ?? "", 10);

    if (result.status !== 0 || isNaN(pid)) {
      throw new FastStackError(
        `Could not start '${command}': ${result.stderr?.toString()}`,
      );
    }

    return pid;
  }

  const log = openSync(options.logFile, "w");

  const child = spawn(process.execPath, args, {
    cwd: options.cwd,
    env: options.env,
    detached: true,
    stdio: ["ignore", log, log],
    windowsHide: true,
  });

  child.unref();
  closeSync(log);

  if (!child.pid) {
    throw new FastStackError(`Could not start 'node ${args.join(" ")}'`);
  }

  return child.pid;
};

const withClient = async <T>(
  config: PostgresConfig,
  callback: (client: pg.Client) => Promise<T>,
): Promise<T> => {
  const client = new pg.Client(config);

  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.end();
  }
};

/**
 * Copies all tables into a separate schema and creates a function restoring
 * them, so that a reset is a single statement that neither drops the database
 * nor invalidates the backend's connections.
 */
const createSnapshot = (config: PostgresConfig): Promise<void> =>
  withClient(config, async (client) => {
    await client.query(`
      DROP SCHEMA IF EXISTS ${pristineSchema} CASCADE;
      CREATE SCHEMA ${pristineSchema};

      DO $snapshot$
      DECLARE t record;
      BEGIN
        FOR t IN
          SELECT table_name FROM information_schema.tables
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
          AND table_name != '_prisma_migrations'
        LOOP
          EXECUTE format(
            'CREATE TABLE ${pristineSchema}.%I AS TABLE public.%I',
            t.table_name, t.table_name
          );
        END LOOP;
      END
      $snapshot$;

      CREATE TABLE ${pristineSchema}."${sequencesTable}" AS
        SELECT sequencename, start_value, last_value
        FROM pg_sequences WHERE schemaname = 'public';

      CREATE FUNCTION ${pristineSchema}.restore() RETURNS void
      LANGUAGE plpgsql AS $restore$
      DECLARE r record;
      BEGIN
        -- do not check foreign keys while the tables are re-filled one by one
        PERFORM set_config('session_replication_role', 'replica', true);

        EXECUTE (
          SELECT 'TRUNCATE TABLE ' || string_agg(format('public.%I', table_name), ', ')
          FROM information_schema.tables
          WHERE table_schema = '${pristineSchema}' AND table_name != '${sequencesTable}'
        );

        FOR r IN
          SELECT table_name FROM information_schema.tables
          WHERE table_schema = '${pristineSchema}' AND table_name != '${sequencesTable}'
        LOOP
          EXECUTE format(
            'INSERT INTO public.%I SELECT * FROM ${pristineSchema}.%I',
            r.table_name, r.table_name
          );
        END LOOP;

        FOR r IN SELECT * FROM ${pristineSchema}."${sequencesTable}" LOOP
          PERFORM setval(
            format('public.%I', r.sequencename)::regclass,
            COALESCE(r.last_value, r.start_value),
            r.last_value IS NOT NULL
          );
        END LOOP;
      END
      $restore$;
    `);
  });

const getStackDatabaseConfig = (state: FastStackState): PostgresConfig => ({
  ...getTemplateConfig(),
  database: state.database,
});

/**
 * Resets the stack's database to the state right after the setup.
 */
export const resetFastDatabase = async (state: FastStackState): Promise<void> =>
  withClient(getStackDatabaseConfig(state), async (client) => {
    await client.query(`SELECT ${pristineSchema}.restore()`);
  });

export const stopFastStack = async (slot = getFastSlot()): Promise<void> => {
  const state = readState(slot);

  if (!state) {
    return;
  }

  assertSlotIsNotInUse(slot);

  for (const pid of [state.frontendPid, state.backendPid]) {
    // never kill a process that merely re-uses the id of a stack process
    if (isStackProcess(pid, state)) {
      debug(`stopping process ${pid} of slot ${slot}`);
      // the processes are started detached, i.e. as leaders of their own group
      killProcessByPid(pid, true);
    }
  }

  await withClient(
    { ...getTemplateConfig(), database: "postgres" },
    async (client) => {
      await client.query(
        `DROP DATABASE IF EXISTS "${state.database}" WITH (FORCE)`,
      );
    },
  );

  rmSync(getStateFile(slot), { force: true });
};

export const startFastStack = async (
  slot = getFastSlot(),
): Promise<FastStackState> => {
  assertSlotIsNotInUse(slot);

  // also ensures no stale processes or database are left behind
  await stopFastStack(slot);

  const template = getTemplateConfig();
  const backendBuildTime = getBackendBuildTime();
  const templateTime = getTemplateTime();

  const backendPort = fastStackBasePort + slot * fastStackPortsPerSlot;
  const frontendPort = backendPort + 1;
  const database = `${template.database}-fast-${slot}`;

  for (const port of [backendPort, frontendPort]) {
    if (!(await isPortFree(port))) {
      throw new FastStackError(
        `Port ${port} is already in use, cannot start the fast stack for slot ${slot}`,
      );
    }
  }

  await cloneDatabaseFromTemplate(template, database);
  await createSnapshot({ ...template, database });

  mkdirSync(getStateDirectory(), { recursive: true });

  // run node directly instead of through yarn: no shell and no wrapper
  // processes, so the process can be killed reliably on all platforms.
  // No coverage is collected in fast mode.
  const backendPid = spawnDetached(["./dist/main.js"], {
    cwd: getBackendPath(),
    env: getBackendEnv({
      databaseUrl: getUrl({ ...template, database }),
      port: backendPort,
      frontendHostname: `http://localhost:${frontendPort}`,
      jwkEndpoint: `${mockOidcProviderUrl}/__oidc__/jwks`,
      userInfoEndpoint: `${mockOidcProviderUrl}/__oidc__/userinfo`,
      clientId: mockOidcClientId,
    }),
    logFile: path.join(getStateDirectory(), `slot-${slot}-backend.log`),
  });

  const frontendPid = spawnDetached([getTsxCli(), "scripts/server.ts"], {
    cwd: getE2EPath(),
    env: {
      ...process.env,
      NODE_ENV: "development",
      PORT: frontendPort.toString(),
      BACKEND_URL: `http://localhost:${backendPort}`,
    },
    logFile: path.join(getStateDirectory(), `slot-${slot}-frontend.log`),
  });

  const state: FastStackState = {
    slot,
    backendPort,
    frontendPort,
    backendPid,
    frontendPid,
    database,
    startedAt: Date.now(),
    backendBuildTime,
    templateTime,
  };

  // write the state before waiting, so a stack that fails to come up can
  // still be stopped
  writeFileSync(getStateFile(slot), JSON.stringify(state, null, 2), {
    encoding: "utf-8",
  });

  await waitUntilStackReachable(backendPort, frontendPort);
  debug(
    `slot ${slot} is running: frontend on :${frontendPort}, backend on :${backendPort}, database '${database}'`,
  );

  // something else could be answering on the ports if a process did not start
  for (const [name, pid] of [
    ["backend", backendPid],
    ["frontend", frontendPid],
  ] as const) {
    if (!isProcessAlive(pid)) {
      throw new FastStackError(
        `The ${name} of the fast stack exited right after its start, see the logs in ${getStateDirectory()}`,
      );
    }
  }

  return state;
};

export type FastStackStatus = {
  state: FastStackState | null;
  // running, and still matching the backend build and the template database
  isUsable: boolean;
};

export const getFastStackStatus = async (
  slot = getFastSlot(),
): Promise<FastStackStatus> => {
  const state = readState(slot);

  if (!state) {
    return { state, isUsable: false };
  }

  const [backend, frontend] = await Promise.all([
    isReachable(state.backendPort, "/api-json"),
    isReachable(state.frontendPort, "/"),
  ]);

  const isUsable =
    backend &&
    frontend &&
    // the backend was re-built or the template was re-created since the start
    state.backendBuildTime === getBackendBuildTime() &&
    state.templateTime === getTemplateTime();

  return { state, isUsable };
};

/**
 * Returns a running stack with a freshly reset database, (re-)starting it if
 * it is not running or no longer matches the backend build or the template.
 */
export const ensureFastStack = async (
  slot = getFastSlot(),
): Promise<FastStackState> => {
  await lockFastSlot(slot);

  const { state, isUsable } = await getFastStackStatus(slot);

  if (state && isUsable) {
    debug(`re-using the stack of slot ${slot}`);
    await resetFastDatabase(state);
    return state;
  }

  debug(`(re-)starting the stack of slot ${slot}`);

  // Start the stack from a separate process and not from here: this function
  // runs inside a Playwright worker, and long-lived processes spawned from a
  // worker crash it on Windows and keep the test run's output pipes open.
  mkdirSync(getStateDirectory(), { recursive: true });
  const logFile = path.join(getStateDirectory(), `slot-${slot}-start.log`);
  const log = openSync(logFile, "w");

  const result = spawnSync(
    process.execPath,
    [getTsxCli(), "scripts/fast-stack.ts", "start"],
    {
      cwd: getE2EPath(),
      env: {
        ...process.env,
        E2E_SLOT: slot.toString(),
        [lockHolderVariable]: process.pid.toString(),
      },
      stdio: ["ignore", log, log],
      windowsHide: true,
    },
  );

  closeSync(log);

  // a freshly started stack has a pristine database
  const startedState = readState(slot);

  if (result.status !== 0 || !startedState) {
    throw new FastStackError(
      `Could not start the fast stack for slot ${slot}:\n${readFileSync(logFile, "utf-8")}`,
    );
  }

  return startedState;
};
