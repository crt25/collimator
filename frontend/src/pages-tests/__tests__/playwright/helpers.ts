import {
  test as testBase,
  expect as expectBase,
} from "playwright-test-coverage";

export const jsonResponse = {
  status: 200,
  contentType: "application/json",
};

export type CrtTestOptions = {
  apiURL: string;
};

// This will allow you to set apiURL in playwright.config.ts
export const test = testBase.extend<CrtTestOptions>({
  apiURL: ["", { option: true }],
});

export const expect = expectBase;
