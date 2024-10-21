import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // ignore the scratch submodules
  testIgnore: "**src/scratch/**/*",

  projects: [
    {
      name: "Desktop Chrome",
      use: devices["Desktop Chrome"],
    },
    {
      name: "Mobile Safari on iPad Mini landscape",
      use: {
        ...devices["iPad Mini landscape"],
        // override the browser, webkit does not seem to support audio in playwright
        browserName: "chromium",
      },
    },
  ],

  use: {
    baseURL: "http://localhost:3101",
  },

  // Run your local dev server before starting the tests.
  webServer: {
    command: "yarn dev:coverage",
    url: "http://localhost:3101",
    timeout: 120 * 1000,
  },
});
