/**
 * Jest transform of the fast test configurations: the TypeScript files are
 * only transpiled and not type-checked ('yarn typecheck' does that).
 */
module.exports = {
  "\\.js$": "babel-jest",
  "\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test-fast.json" }],
};
