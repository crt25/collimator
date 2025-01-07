import { defineConfig, devices, PlaywrightTestConfig } from "@playwright/test";
import { CrtTestOptions } from "./helpers";
import {
  mockOidcClientId,
  mockOidcProviderPort,
  mockOidcProviderUrl,
  mockOidcProxyUrl,
} from "./setup/config";
import {
  setupBackendPort,
  setupBackendShutdownPort,
  setupFrontendPort,
  setupProjectNamePrefix,
} from "./setup/helpers";

const frontendUrl = `http://localhost:${setupFrontendPort}`;
const backendUrl = `http://localhost:${setupBackendPort}`;

const authenticationProjectName = `${setupProjectNamePrefix}authentication`;
const setupFinishProjectName = `${setupProjectNamePrefix}finish`;

const skipSetup = process.env.SKIP_SETUP === "true";
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not set");
}

const setupDependencies = [setupFinishProjectName];

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
    {
      name: setupFinishProjectName,
      testMatch: /setup\/setup-finish\.ts/,
      dependencies: skipSetup ? [] : [authenticationProjectName],
    },
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

  use: {
    scratchURL: "http://localhost:3101/scratch",
  },

  // timeout per test
  timeout: 30 * 1000,

  webServer: {
    // Run your local dev server before starting the tests.
    command: `tsx ./scripts/e2e-testing.ts`,
    url: frontendUrl,
    env: {
      ...process.env,
      NODE_ENV: "production",
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
    },
    stdout: "pipe",
    stderr: "pipe",

    // timeout for building the frontend, starting the backend, frontend and OpenID connect mock server
    timeout: 180 * 1000,
  },
};

if (skipSetup) {
  config.webServer = undefined;
}

export default defineConfig<CrtTestOptions>(config);
