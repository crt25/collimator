/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import nextJest from "next/jest.js";
import type { Config } from "jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

const config: Config = {
  testMatch: [
    "**/__tests__/jest/**/*.spec.ts",
    "**/__tests__/jest/**/*.spec.tsx",
  ],
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // The test environment that will be used for testing
  testEnvironment: "jsdom",

  // support custom module mappings
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },

  setupFiles: ["<rootDir>/src/tests/polyfill.ts"],

  setupFilesAfterEnv: ["jest-extended/all"],
};

export default createJestConfig(config);
