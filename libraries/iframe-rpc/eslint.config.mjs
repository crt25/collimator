import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import jestExtended from "eslint-plugin-jest-extended";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: compat.extends(
      "../../.eslintrc.js",
      "eslint:recommended",
      "plugin:prettier/recommended",
    ),

    plugins: {
      "@typescript-eslint": typescriptEslint,
      import: fixupPluginRules(_import),
      "jest-extended": jestExtended,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
      },

      parser: tsParser,
    },

    rules: {
      "no-unused-vars": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "import/no-duplicates": [
        "error",
        {
          "prefer-inline": true,
        },
      ],

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
  },
]);
