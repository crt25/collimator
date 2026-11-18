/**
 * Same tests as 'yarn test:e2e', but without type-checking, see
 * ../jest.fast.config.js.
 */
const baseConfig = require("./jest-e2e.json");
const fastTransform = require("./fast-transform");

module.exports = {
  ...baseConfig,
  rootDir: "..",
  transform: fastTransform,
};
