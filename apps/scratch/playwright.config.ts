import { defineConfig, devices, PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  // ignore the scratch submodules
  testIgnore: "**src/scratch-editor/**/*",

  // Assertion state is produced by a two-phase Scratch-VM cycle (project run ->
  // after-run assertion hats -> ASSERTIONS_CHECKED) and then rendered by React.
  // On the heavy app-tests CI job that chain occasionally takes longer than
  // Playwright's 5s default, which made assertion-state expectations flaky. Give
  // web-first assertions more headroom, and retry once (as the e2e suite does)
  // so a lone transient hiccup doesn't fail the whole job.
  expect: { timeout: 15 * 1000 },
  retries: 1,

  projects: [
    {
      name: "Desktop",
      use: devices["Desktop Chrome"],
    },
    {
      name: "iPad Mini landscape",
      use: {
        ...devices["iPad Mini landscape"],
        // override the browser, webkit does not seem to support audio in playwright
        browserName: "chromium",
      },
    },
  ],

  use: {
    baseURL: "http://localhost:3101/scratch",
  },
};

// eslint-disable-next-line no-undef
if (!process.env.SERVER_ALREADY_RUNS) {
  config.webServer = {
    // Run your local dev server before starting the tests.
    command: "yarn dev:coverage",
    url: "http://localhost:3101/scratch/edit",
    timeout: 180 * 1000,
  };
}

export default defineConfig(config);
