import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "eslint/config";
import _import from "eslint-plugin-import";
import { fixupPluginRules } from "@eslint/compat";
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
    extends: compat.extends("../.eslintrc.js", "plugin:prettier/recommended"),

    plugins: {
      import: fixupPluginRules(_import),
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
  {
    files: ["**/*.tsx"],

    rules: {
      "@typescript-eslint/no-unnecessary-type-constraint": "off",
    },
  },
  {
    files: ["src/api/**/generated/**/*", "**/*.js"],

    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
]);
