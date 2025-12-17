import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "eslint/config";
import _import from "eslint-plugin-import";
import { fixupPluginRules } from "@eslint/compat";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: compat.extends("../.eslintrc.js"),

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
  // Should be 2nd to last to override other configs, see https://github.com/prettier/eslint-config-prettier?tab=readme-ov-file#installation.
  eslintConfigPrettier,
  // Must be imported last, see https://github.com/prettier/eslint-plugin-prettier?tab=readme-ov-file#configuration-legacy-eslintrc.
  eslintPluginPrettierRecommended,
]);
