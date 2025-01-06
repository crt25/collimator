const path = require("path");

module.exports = {
  extends: [
    path.join(__dirname, "../.eslintrc.js"),
    "plugin:prettier/recommended",
    "plugin:import/recommended",
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
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"]
    }]
  },
};
