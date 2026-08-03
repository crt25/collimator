const fs = require("node:fs");
const path = require("node:path");

const dsn = process.env.APP_JUPYTER_SENTRY_DSN ?? "";
const content = `export const SENTRY_DSN = ${JSON.stringify(dsn)};\n`;

fs.writeFileSync(path.resolve(__dirname, "../src/sentry-config.ts"), content);
