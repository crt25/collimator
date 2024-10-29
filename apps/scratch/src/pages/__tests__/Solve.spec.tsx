import { readFileSync } from "fs";
import { resolve } from "path";
import { test, expect } from "playwright-test-coverage";
import {
  defineCustomMessageEvent,
  MockMessageEvent,
} from "./mock-message-event";
import {
  getBlockHiddenButtonSelector,
  getBlockSelector,
  getBlockShownButtonSelector,
} from "./locators";

// eslint-disable-next-line no-undef
const testTask = readFileSync(resolve(__dirname, "test-task.zip"));

declare global {
  interface Window {
    // we store posted messages on the window object instead of actually posting so we can assert on them
    postedMessages: { message: unknown; options: unknown }[];
    MockMessageEvent: typeof MockMessageEvent;
  }
}

test.describe("/solve/sessionId/taskId", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    page.on("framenavigated", async () =>
      page.evaluate(() => {
        window.postedMessages = [];

        // @ts-expect-error - we mock the parent window
        window.parent = {
          postMessage: (message, options) => {
            window.postedMessages.push({ message, options });
          },
        };
      }),
    );

    await page.goto(`${baseURL!}/solve/some-session-id/some-task-id`);

    await page.waitForSelector("#root");

    await defineCustomMessageEvent(page);
  });

  test("can select the stage", async ({ page }) => {
    await page.getByTestId("stage-selector").click();

    // motion blocks should not be visible
    expect(page.locator("[data-id='motion_movesteps']")).toHaveCount(0);
  });

  test("can toggle fullscreen", async ({ page }) => {
    const fullScreenButton = page.getByTestId("stage-fullscreen-button");
    await fullScreenButton.click();

    expect(fullScreenButton).toHaveCount(0);

    const unFullScreenButton = page.getByTestId("stage-unfullscreen-button");

    await unFullScreenButton.click();
    expect(unFullScreenButton).toHaveCount(0);
  });

  test("can get height via window.postMessage", async ({ page }) => {
    await page.evaluate(() => {
      const event = new window.MockMessageEvent(window.parent, {
        id: 0,
        type: "request",
        procedure: "getHeight",
      });

      window.dispatchEvent(event);
    });

    await page.waitForFunction(() => window.postedMessages.length > 0);

    const messages = await page.evaluate(() => window.postedMessages);

    expect(messages).toHaveLength(1);

    expect(messages[0].message).toEqual({
      id: 0,
      type: "response",
      procedure: "getHeight",
      result: expect.any(Number),
    });
  });

  test("can get submission via window.postMessage", async ({ page }) => {
    await page.evaluate(() => {
      const event = new window.MockMessageEvent(window.parent, {
        id: 0,
        type: "request",
        procedure: "getSubmission",
      });

      window.dispatchEvent(event);
    });

    await page.waitForFunction(() => window.postedMessages.length > 0);

    const messages = await page.evaluate(() => window.postedMessages);

    expect(messages).toHaveLength(1);

    expect(messages[0].message).toEqual({
      id: 0,
      type: "response",
      procedure: "getSubmission",
      // blobs cannot be transferred, see https://github.com/puppeteer/puppeteer/issues/3722
      result: {},
    });
  });

  test("can load task via window.postMessage", async ({ page }) => {
    page.route(/test-task.sb3$/, (route) =>
      route.fulfill({
        body: testTask,
        contentType: "application/zip",
        status: 200,
      }),
    );

    await page.evaluate(async () => {
      const task = await fetch("https://example.com/test-task.sb3").then(
        (response) => response.blob(),
      );

      const event = new window.MockMessageEvent(window.parent, {
        id: 0,
        type: "request",
        procedure: "loadTask",
        arguments: task,
      });

      window.dispatchEvent(event);
    });

    await page.waitForFunction(() => window.postedMessages.length > 0);

    const messages = await page.evaluate(() => window.postedMessages);

    expect(messages).toHaveLength(1);

    expect(messages[0].message).toEqual({
      id: 0,
      type: "response",
      procedure: "loadTask",
      result: undefined,
    });

    // ensure the block visibility is correctly loaded

    // these blocks are allowed
    expect(page.locator(getBlockSelector("motion_turnright"))).toHaveCount(1);
    expect(page.locator(getBlockSelector("motion_turnleft"))).toHaveCount(1);
    expect(page.locator(getBlockSelector("motion_goto"))).toHaveCount(1);
    // the rest isn't
    expect(page.locator(getBlockSelector("motion_gotoxy"))).toHaveCount(0);

    // ensure the block visibility cannot be toggled
    expect(
      page.locator(getBlockShownButtonSelector("motion_turnright")),
    ).toHaveCount(0);

    expect(
      page.locator(getBlockHiddenButtonSelector("motion_turnright")),
    ).toHaveCount(0);
  });
});
