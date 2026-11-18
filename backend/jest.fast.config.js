/**
 * Same tests as 'yarn test', but the TypeScript files are only transpiled and
 * not type-checked, which makes the run several times faster.
 *
 * Type errors are not reported by this configuration, run 'yarn typecheck'
 * for those. 'yarn test' remains the reference.
 */
const { jest: baseConfig } = require("./package.json");
const fastTransform = require("./test/fast-transform");

module.exports = {
  ...baseConfig,
  transform: fastTransform,
};
