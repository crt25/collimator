import { defineConfig, devices, PlaywrightTestConfig } from "@playwright/test";
import { CrtTestOptions } from "./helpers";
import { getFastSlot, isFastMode } from "./setup/fast-stack";
import { isTracing, traceMark } from "./setup/trace";
import {
  mockOidcClientId,
  mockOidcProviderPort,
  mockOidcProviderUrl,
  mockOidcProxyUrl,
} from "./setup/config";
import {
  frontendDevServerCommand,
  frontendDevServerUrl,
  getFrontendDevServerEnv,
  getFrontendMode,
  setupBackendPort,
  setupBackendShutdownPort,
  setupFrontendPort,
  setupProjectNamePrefix,
} from "./setup/helpers";

traceMark("playwright config loaded");

const frontendUrl = `http://localhost:${setupFrontendPort}`;
const backendUrl = `http://localhost:${setupBackendPort}`;

const authenticationProjectName = `${setupProjectNamePrefix}authentication`;
const setupFinishProjectName = `${setupProjectNamePrefix}finish`;

// Fast mode (E2E_FAST=true) is meant for running single tests repeatedly: the
// setup projects and the web server are skipped and the tests run against a
// stack that is kept alive between invocations, see setup/fast-stack.ts.
// It requires the regular setup to have run once.
const fastMode = isFastMode;
const skipSetup = process.env.SKIP_SETUP === "true" || fastMode;
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not set");
}

const setupDependencies = fastMode ? [] : [setupFinishProjectName];

// Frontend mode "dev": instead of building the frontend before the run, a
// single Next.js dev server is shared by the setup and by all workers (each
// worker's proxy forwards pages to it). An already running dev server is
// re-used, so keeping one open (`yarn start:frontend-dev`) avoids its start-up time.
// The fast stack serves the static build and does not use it.
const useFrontendDevServer = getFrontendMode() === "dev" && !fastMode;

const frontendDevServer = {
  command: frontendDevServerCommand,
  cwd: "../frontend",
  url: frontendDevServerUrl,
  reuseExistingServer: true,
  env: getFrontendDevServerEnv(),
  // when tracing, show the dev server's log: it prints how long each page
  // took to compile and render
  stdout: isTracing ? ("pipe" as const) : ("ignore" as const),
  stderr: "pipe" as const,
  timeout: 180 * 1000,
};

const setupServer = {
  // Run your local dev server before starting the tests.
  command: `tsx ./scripts/e2e-testing.ts`,
  url: frontendUrl,
  env: {
    ...process.env,
    NODE_ENV: "production",
    E2E_TRACE_SCOPE: "setup",
    // union of all environment variables needed for
    // 1) seeding the database
    SEEDING_MODE: "e2e",
    DATABASE_URL: dbUrl,
    // 2) the mock oidc server
    OIDC_MOCK_SERVER_PORT: mockOidcProviderPort.toString(),
    OIDC_MOCK_SERVER_PROXY_URL: mockOidcProxyUrl,
    FRONTEND_URL: frontendUrl,
    // 3) the backend server
    BACKEND_PORT: setupBackendPort.toString(),
    BACKEND_STOP_PORT: setupBackendShutdownPort.toString(),
    OPENID_CONNECT_JWK_ENDPOINT: `${mockOidcProviderUrl}/__oidc__/jwks`,
    OPENID_CONNECT_USERINFO_ENDPOINT: `${mockOidcProviderUrl}/__oidc__/userinfo`,
    OIDC_CLIENT_ID: mockOidcClientId,
    // 4) the frontend server
    NEXT_PUBLIC_BACKEND_HOSTNAME: backendUrl,
  } as Record<string, string>,
  stdout: "pipe" as const,
  stderr: "pipe" as const,

  // timeout for building the frontend, starting the backend, frontend and OpenID connect mock server
  timeout: 180 * 1000,
};

const config: PlaywrightTestConfig<CrtTestOptions> = {
  testMatch: "*.spec.ts",

  projects: [
    ...(skipSetup
      ? []
      : [
          /**
           * First (unless skipSetup is set), the e2e-testing script is being run.
           * After that - again unless skipSetup is set - we run these two setup projects.
           * The e2e-testing script resets and seeds the new test db and starts a frontend, a backend
           * and a mock OpenID Connect server instance. These are then used during the setup projects
           * to initialize the test database such as authenticating and storing the respective authentication state.
           * Whatever is in the test db after the setup stage will be cloned into each test file afterwards.
           *
           * Finally, the actual tests are run.
           * When starting a worker, an automatic worker-scope fixture clones the test db and starts a backend
           * and frontend instance specific to that worker.
           * Additionally, an automatic test-scoped fixture resets the database whenever the test file changes.
           */
          {
            name: authenticationProjectName,
            testMatch: /setup\/authentication\.ts/,
          },
        ]),
    ...(fastMode
      ? []
      : [
          {
            name: setupFinishProjectName,
            testMatch: /setup\/setup-finish\.ts/,
            dependencies: skipSetup ? [] : [authenticationProjectName],
          },
        ]),
    {
      name: "Desktop",
      use: devices["Desktop Chrome"],
      dependencies: setupDependencies,
    },
    {
      name: "iPad Mini landscape",
      use: {
        ...devices["iPad Mini landscape"],
        // override the browser, webkit does not seem to support audio in playwright
        browserName: "chromium",
      },
      dependencies: setupDependencies,
    },
  ],

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  // timeout per test
  timeout: 160 * 1000,

  // the dev server comes first: the setup's frontend proxy forwards to it
  webServer: [
    ...(useFrontendDevServer ? [frontendDevServer] : []),
    ...(skipSetup ? [] : [setupServer]),
  ],

  // collected traces on the CI
  // https://playwright.dev/docs/trace-viewer#recording-a-trace-on-ci
  // no retries in fast mode: a retried failure would hide a real one
  retries: fastMode ? 0 : 1,
  // a fast stack serves a single worker. Each slot gets its own output
  // directory: Playwright clears it on start, which would break a run of
  // another slot that is in progress.
  ...(fastMode
    ? {
        workers: 1,
        outputDir: `test-results/fast-slot-${getFastSlot()}`,
      }
    : {}),
  use: {
    trace: "on-first-retry",
  },
};

export default defineConfig<CrtTestOptions>(config);
