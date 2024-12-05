import { isDebug } from "@/pages-tests/__tests__/playwright/helpers";
import { killProcess } from "@/pages-tests/__tests__/playwright/setup/helpers";
import { existsSync, unlinkSync } from "fs";

export const userSeedsFile = "playwright/.seed/users.json";

export const pidDirectory = "playwright/.pid";
export const oidcPidFile = `${pidDirectory}/oidc`;
export const backendPidFile = `${pidDirectory}/backend`;
export const frontendPidFile = `${pidDirectory}/frontend`;

export const killE2eSetupProcesses = (): void => {
  [backendPidFile, frontendPidFile, oidcPidFile].forEach((pidFile) => {
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
};
