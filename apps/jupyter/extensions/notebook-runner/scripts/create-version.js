const { version } = require("../package.json");

const fs = require("fs");
const content = `export const VERSION = "${version}";\n`;
fs.writeFileSync("src/version.ts", content);
