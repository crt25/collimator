import { Page, Request } from "@playwright/test";
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

export const mockUrlResponses = (
  page: Page,
  url: string,
  responses: {
    get: unknown;
    post: unknown;
    patch?: unknown;
    delete?: unknown;
  },
  onRequest: {
    get?: (request: Request) => void;
    post?: (request: Request) => void;
    patch?: (request: Request) => void;
    delete?: (request: Request) => void;
  },
): Promise<void> =>
  page.route(url, (route) => {
    if (responses.post && route.request().method() === "POST") {
      onRequest.post?.(route.request());

      return route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(responses.post),
      });
    }

    if (responses.patch && route.request().method() === "PATCH") {
      onRequest.patch?.(route.request());

      return route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(responses.patch),
      });
    }

    if (responses.delete && route.request().method() === "DELETE") {
      onRequest.delete?.(route.request());

      return route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(responses.delete),
      });
    }

    onRequest.get?.(route.request());

    return route.fulfill({
      ...jsonResponse,
      body: JSON.stringify(responses.get),
    });
  });
