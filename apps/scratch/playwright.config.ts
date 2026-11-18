import { defineConfig, devices, PlaywrightTestConfig } from "@playwright/test";

// What the tests run against (SCRATCH_TEST_TARGET):
// - "coverage" (default): a development server with coverage instrumentation,
//   started and stopped by the tests. This is what 'yarn test' and CI use.
// - "dev": a plain development server. One that is already running is reused,
//   so a change to the source is picked up within seconds. Use this for quick
//   edit-and-test loops: run 'yarn dev' once and keep it running.
// - "build": the production build (yarn build), served as static files. Pages
//   load several times faster, so this is the fastest way to run many tests,
//   but a change to the source requires a new build.
// Only "coverage" collects coverage.
const targets = ["coverage", "dev", "build"] as const;
type TestTarget = (typeof targets)[number];

const target = (process.env.SCRATCH_TEST_TARGET ?? "coverage") as TestTarget;

if (!targets.includes(target)) {
  throw new Error(
    `SCRATCH_TEST_TARGET must be one of ${targets.join(", ")}, got '${target}'`,
  );
}

const testsBuild = target === "build";

// Several checkouts can be tested side by side by giving each its own port.
// Not for "coverage": 'yarn dev:coverage' always listens on port 3101.
if (target === "coverage" && process.env.SCRATCH_TEST_PORT !== undefined) {
  throw new Error(
    "SCRATCH_TEST_PORT is only supported with SCRATCH_TEST_TARGET=dev or build",
  );
}

const port = Number(
  process.env.SCRATCH_TEST_PORT ?? (testsBuild ? 3103 : 3101),
);

const config: PlaywrightTestConfig = {
  // ignore the scratch submodules
  testIgnore: "**src/scratch-editor/**/*",

  // The tests do not share any state, so the tests of one file can be spread
  // over all workers. Otherwise the largest file determines the duration.
  // Not against the development server: its pages load several times slower
  // and the tests timed out in bursts when run this way.
  fullyParallel: testsBuild,

  // Every test renders the Scratch stage in its own browser page. With the
  // default (half of the cores) and all workers busy, pages take so long to
  // load that tests time out in bursts; slightly fewer workers finish sooner.
  workers: testsBuild ? "40%" : undefined,

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
    baseURL: `http://localhost:${port}/scratch`,
  },
};

if (testsBuild) {
  config.webServer = {
    command: "node scripts/serve-build.mjs",
    url: `http://localhost:${port}/scratch/edit`,
    env: { PORT: String(port) },
    // the server is stateless, so one that is still running can be shared
    reuseExistingServer: true,
    timeout: 30 * 1000,
  };
} else if (target === "dev") {
  config.webServer = {
    // same as 'yarn dev', but on the configured port
    command: `yarn next dev --webpack --port ${port}`,
    url: `http://localhost:${port}/scratch/edit`,
    env: { NODE_OPTIONS: "--preserve-symlinks" },
    reuseExistingServer: true,
    // the first compilation of the app takes minutes
    timeout: 300 * 1000,
  };
} else if (!process.env.SERVER_ALREADY_RUNS) {
  config.webServer = {
    // Run your local dev server before starting the tests.
    command: "yarn dev:coverage",
    url: `http://localhost:${port}/scratch/edit`,
    timeout: 180 * 1000,
  };
}

export default defineConfig(config);
