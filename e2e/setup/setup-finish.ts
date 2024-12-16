import { mkdirSync, rmSync } from "fs";
import { test as setup } from "../helpers";
import { killE2eSetupProcesses } from "../scripts/e2e-testing-config";
import { portLockDirectory } from "./helpers";

setup("finish setup", async () => {
  await killE2eSetupProcesses();

  // delete all files in the .port directory to ensure we are starting with a clean state
  rmSync(portLockDirectory, { recursive: true, force: true });

  // create the directory again
  mkdirSync(portLockDirectory, { recursive: true });
});
