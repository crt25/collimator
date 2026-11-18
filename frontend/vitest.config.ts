import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

import { playwright } from "@vitest/browser-playwright";

const dirname =
  typeof __dirname === "undefined"
    ? path.dirname(fileURLToPath(import.meta.url))
    : __dirname;

// Vitest's default port for the browser tests (63315) lies in the range from
// which Windows reserves ports for Hyper-V and Docker; when it is reserved, the
// tests cannot start (listen EACCES). Only Windows gets another port by
// default, VITEST_BROWSER_PORT sets one explicitly.
const browserPort =
  process.env.VITEST_BROWSER_PORT ??
  (process.platform === "win32" ? "6316" : undefined);
const browserApi =
  browserPort === undefined ? {} : { api: { port: Number(browserPort) } };

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
            ...browserApi,
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
