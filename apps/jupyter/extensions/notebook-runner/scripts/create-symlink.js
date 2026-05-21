const fs = require("fs");
const path = require("path");

const target = path.resolve(__dirname, "../../../../../libraries/iframe-rpc");
const linkPath = path.resolve(__dirname, "../src/iframe-rpc");

const createSymlink = () => {
  fs.symlinkSync(target, linkPath, "dir");
  console.debug(`Symlink created: ${linkPath} -> ${target}`);
};

const existingStats = fs.existsSync(linkPath) ? fs.lstatSync(linkPath) : null;

if (!existingStats) {
  createSymlink();
  return;
}

if (!existingStats.isSymbolicLink()) {
  console.error(
    `Cannot create symlink: ${linkPath} already exists and is not a symlink`,
  );
  return;
}

const existingTarget = path.resolve(
  path.dirname(linkPath),
  fs.readlinkSync(linkPath),
);

if (existingTarget === target) {
  console.debug(`Symlink already exists: ${linkPath} -> ${target}`);
  return;
}

fs.unlinkSync(linkPath);
createSymlink();
