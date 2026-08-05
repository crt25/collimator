const { version } = require("../package.json");

const fs = require("node:fs");
const path = require("node:path");
const sentryEnvironment = process.env.SENTRY_ENVIRONMENT ?? "development";
const content = `export const VERSION = ${JSON.stringify(version)};
export const SENTRY_ENVIRONMENT = ${JSON.stringify(sentryEnvironment)};
`;

fs.writeFileSync(path.resolve(__dirname, "../src/version.ts"), content);
