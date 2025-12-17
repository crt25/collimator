import path from "node:path";
import { fileURLToPath } from "node:url";
import importPlugin from "eslint-plugin-import";
import { defineConfig, globalIgnores } from "eslint/config";
import jestExtended from "eslint-plugin-jest-extended";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import storybook from "eslint-plugin-storybook";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(["dist", ".next", ".nyc_output", ".swc", "coverage*"]),
  ...storybook.configs["flat/recommended"],
  {
    extends: [
      ...compat.extends("next"),
      ...compat.extends("next/core-web-vitals"),
      ...compat.extends("../.eslintrc.js"),
    ],

    plugins: {
      "jest-extended": jestExtended,
      import: importPlugin,
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

      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@fontawesome",
              message: "Use icons from react-icons instead.",
            },
          ],
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
  {
    files: ["**/*.tsx"],

    rules: {
      "@typescript-eslint/no-unnecessary-type-constraint": "off",
    },
  },
  {
    files: ["**/*.stories.tsx"],

    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
  {
    files: ["src/api/**/generated/**/*", "**/*.js"],

    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
  {
    // According to https://github.com/storybookjs/storybook/tree/next/code/lib/eslint-plugin#installation
    ignores: ["!.storybook"],
  },
  // Should be 2nd to last to override other configs, see https://github.com/prettier/eslint-config-prettier?tab=readme-ov-file#installation.
  eslintConfigPrettier,
  // Must be imported last, see https://github.com/prettier/eslint-plugin-prettier?tab=readme-ov-file#configuration-legacy-eslintrc.
  eslintPluginPrettierRecommended,
]);
