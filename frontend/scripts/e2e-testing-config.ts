import { isDebug } from "@/pages-tests/__tests__/playwright/helpers";
import {
  killProcess,
  setupBackendShutdownPort,
  triggerBackendGracefulShutdown,
  waitForProcessToStop,
} from "@/pages-tests/__tests__/playwright/setup/helpers";
import { existsSync, readFileSync, unlinkSync } from "fs";

export const pidDirectory = "playwright/.pid";
export const oidcPidFile = `${pidDirectory}/oidc`;
export const backendPidFile = `${pidDirectory}/backend`;
export const frontendPidFile = `${pidDirectory}/frontend`;

export const killE2eSetupProcesses = async (): Promise<void> => {
  [frontendPidFile, oidcPidFile].forEach((pidFile) => {
    if (existsSync(pidFile)) {
      try {
        killProcess(pidFile);
        unlinkSync(pidFile);
      } catch (e) {
        // ignore errors - process might have already been killed or just stopped
        if (isDebug) {
          console.error(`Failed killing process ${pidFile}`, e);
        }
      }
    }
  });

  // the backend must be stopped gracefully for the coverage to be collected
  try {
    const backendPid = parseInt(readFileSync(backendPidFile, "utf-8"), 10);
    const backendStops = waitForProcessToStop(backendPid);
    await triggerBackendGracefulShutdown(setupBackendShutdownPort).catch(() => {
      // ignore exceptions
    });

    await backendStops;
    unlinkSync(backendPidFile);
  } catch (e) {
    // ignore errors - process might have already been killed or just stopped
    if (isDebug) {
      console.error(`Failed killing process ${backendPidFile}`, e);
    }
  }
};
