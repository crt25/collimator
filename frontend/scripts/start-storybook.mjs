import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const url = process.env.STORYBOOK_URL ?? "http://localhost:6006";
const pidFile = "storybook.pid";
const intervalMs = 3000;
const timeoutMs = 3 * 60 * 1000;

const child = spawn("yarn", ["storybook"], {
  detached: true,
  stdio: "ignore",
  shell: process.platform === "win32",
  windowsHide: true,
});

writeFileSync(pidFile, String(child.pid));
child.unref();

const deadline = Date.now() + timeoutMs;
while (Date.now() < deadline) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (res.ok) {
      process.stdout.write("\n");
      process.exit(0);
    }
  } catch {
    // not up yet
  }
  process.stdout.write(".");
  await new Promise((r) => setTimeout(r, intervalMs));
}

console.error(`\nTimed out after ${timeoutMs / 1000}s waiting for ${url}`);
process.exit(1);
