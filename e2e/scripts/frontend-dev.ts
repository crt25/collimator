/**
 * Starts the Next.js dev server the e2e tests use in frontend mode "dev".
 *
 * The test run starts (and stops) this server itself if it is not running.
 * Keeping it open in a separate terminal saves its start-up time on each run.
 */
import { spawn } from "child_process";
import {
  frontendDevServerCommand,
  getFrontendDevServerEnv,
  getFrontendPath,
} from "../setup/helpers";

const devServer = spawn(frontendDevServerCommand, {
  cwd: getFrontendPath(),
  env: getFrontendDevServerEnv(),
  shell: true,
  stdio: "inherit",
});

// no exit code: the dev server was killed by a signal
devServer.on("exit", (code) => process.exit(code ?? 1));
