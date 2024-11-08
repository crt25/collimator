import { CrtTestOptions } from "@/pages-tests/__tests__/playwright/helpers";
import { defineConfig, devices, PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig<CrtTestOptions> = {
  testMatch: "**/__tests__/playwright/**/*.spec.tsx",

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
    baseURL: "http://localhost:3000",
    apiURL: "http://localhost:3001",
  },

  // timeout per test
  timeout: 60 * 1000,
};

// eslint-disable-next-line no-undef
if (!process.env.SERVER_ALREADY_RUNS) {
  config.webServer = {
    // Run your local dev server before starting the tests.
    command: "yarn dev:coverage",
    url: "http://localhost:3000",

    // timeout for starting up the development server
    timeout: 120 * 1000,
  };
}

export default defineConfig<CrtTestOptions>(config);
