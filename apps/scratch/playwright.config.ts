import { defineConfig, devices, PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  // ignore the scratch submodules
  testIgnore: "**src/scratch/**/*",

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
    url: "http://localhost:3101/scratch",
    timeout: 120 * 1000,
  };
}

export default defineConfig(config);
