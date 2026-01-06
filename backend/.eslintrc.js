const path = require("path");

module.exports = {
  extends: [
    path.join(__dirname, "../.eslintrc.js"),
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  env: {
    node: true,
    jest: true,
  },
  plugins: ["import"],
  ignorePatterns: [
    "src/ast/antlr-grammars/**/*",
    ".yarn",
    "antlr",
    "coverage",
    "coverage-e2e",
    "dist",
    "docker",
    "node_modules",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "import/no-duplicates": ["error", { "prefer-inline": true }],
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
          "type",
        ],
      },
    ],
  },
};
