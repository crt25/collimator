import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";

const pidFile = "storybook.pid";

if (!existsSync(pidFile)) {
  process.exit(0);
}

const pid = Number(readFileSync(pidFile, "utf8").trim());

if (Number.isFinite(pid) && pid > 0) {
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/F", "/T", "/PID", String(pid)], {
      stdio: "ignore",
    });
  } else {
    try {
      process.kill(pid);
    } catch {
      // already gone
    }
  }
}

unlinkSync(pidFile);
