const fs = require("node:fs");
const path = require("node:path");

const dsn = process.env.APP_JUPYTER_SENTRY_DSN ?? "";
const environment = process.env.SENTRY_ENVIRONMENT ?? "development";
const content = `export const SENTRY_DSN = ${JSON.stringify(dsn)};
export const SENTRY_ENVIRONMENT = ${JSON.stringify(environment)};
`;

fs.writeFileSync(path.resolve(__dirname, "../src/sentry-config.ts"), content);
