import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 3102);

/**
 * End-to-end tests of the Jupyter app on its own: the built JupyterLite app is
 * served as static files and the platform (the page that embeds the app in an
 * iframe) is replaced by a stub, see tests/helpers/host.ts.
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.ts",

  forbidOnly: !!process.env.CI,

  // every page load starts JupyterLite and a Python kernel in the browser
  timeout: 180 * 1000,
  expect: { timeout: 30 * 1000 },

  retries: process.env.CI ? 1 : 0,

  use: {
    baseURL: `http://localhost:${port}/jupyter/`,
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "Desktop",
      use: devices["Desktop Chrome"],
    },
    {
      name: "iPad Mini landscape",
      use: {
        ...devices["iPad Mini landscape"],
        // same browser as the other suites use for this profile
        browserName: "chromium",
      },
    },
  ],

  webServer: {
    command: "node scripts/serve.mjs",
    url: `http://localhost:${port}/jupyter/lab/index.html`,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(port) },
    timeout: 30 * 1000,
  },
});
