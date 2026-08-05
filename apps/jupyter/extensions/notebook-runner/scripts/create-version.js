const { version } = require("../package.json");

const fs = require("node:fs");
const path = require("node:path");
const content = `export const VERSION = "${version}";\n`;

fs.writeFileSync(path.resolve(__dirname, "../src/version.ts"), content);
