import path from "node:path";
import { fileURLToPath } from "node:url";
import importPlugin from "eslint-plugin-import";
import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
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
  globalIgnores(["**/*.d.ts", "src/scratch-editor"]),
  js.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    extends: [...compat.extends("../../.eslintrc.js")],

    plugins: {
      "@typescript-eslint": typescriptEslint,
      import: importPlugin,
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
  // Should be 2nd to last to override other configs, see https://github.com/prettier/eslint-config-prettier?tab=readme-ov-file#installation.
  eslintConfigPrettier,
  // Must be imported last, see https://github.com/prettier/eslint-plugin-prettier?tab=readme-ov-file#configuration-legacy-eslintrc.
  eslintPluginPrettierRecommended,
]);
