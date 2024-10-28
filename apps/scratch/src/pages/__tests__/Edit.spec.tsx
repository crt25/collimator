import { readFileSync } from "fs";
import { resolve } from "path";
import { test, expect } from "playwright-test-coverage";
import {
  defineCustomMessageEvent,
  MockMessageEvent,
} from "./mock-message-event";
import { getBlockHiddenButtonSelector, getBlockSelector } from "./locators";

// eslint-disable-next-line no-undef
const testTask = readFileSync(resolve(__dirname, "test-task.zip"));

declare global {
  interface Window {
    // we store posted messages on the window object instead of actually posting so we can assert on them
    postedMessages: { message: unknown; options: unknown }[];
    MockMessageEvent: typeof MockMessageEvent;
  }
}

test.describe("/edit/taskId", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    page.on(
      "framenavigated",
      async () =>
        await page.evaluate(() => {
          window.postedMessages = [];

          // @ts-expect-error - we mock the parent window
          window.parent = {
            postMessage: (message, options) => {
              window.postedMessages.push({ message, options });
            },
          };
        }),
    );

    await page.goto(`${baseURL!}/edit/some-task-id`);

    await page.waitForSelector("#root");

    await defineCustomMessageEvent(page);
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

  test("can get task via window.postMessage", async ({ page }) => {
    await page.evaluate(() => {
      const event = new window.MockMessageEvent(window.parent, {
        id: 0,
        type: "request",
        procedure: "getTask",
      });

      window.dispatchEvent(event);
    });

    await page.waitForFunction(() => window.postedMessages.length > 0);

    const messages = await page.evaluate(() => window.postedMessages);

    expect(messages).toHaveLength(1);

    expect(messages[0].message).toEqual({
      id: 0,
      type: "response",
      procedure: "getTask",
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
    expect(
      page.locator(getBlockHiddenButtonSelector("motion_turnright")),
    ).toHaveCount(1);

    expect(
      page.locator(getBlockHiddenButtonSelector("motion_turnleft")),
    ).toHaveCount(1);

    expect(
      page.locator(getBlockHiddenButtonSelector("motion_goto")),
    ).toHaveCount(1);
  });

  test("can toggle block visibility", async ({ page }) => {
    const firstBlock = page
      .locator(getBlockSelector("motion_movesteps"))
      .first();

    let button = firstBlock.getByTestId("hidden-block-button");
    expect(button).toHaveCount(1);
    await button.click();

    // after clicking the button, the block should be shown and the test id different
    expect(button).toHaveCount(0);

    button = firstBlock.getByTestId("shown-block-button");
    expect(button).toHaveCount(1);
    await button.click();

    // and after clicking again, the block should be hidden and the test id different again
    expect(button).toHaveCount(0);
  });

  test("can add extension", async ({ page }) => {
    const addExtensionButton = page.getByTestId("add-extension-button");
    await addExtensionButton.click();

    // click the first extension. the first image is the back-button
    const firstExtension = page.locator(".ReactModalPortal img").nth(2);

    await firstExtension.click();

    // ensure the custom block is added
    expect(page.locator("[data-id='example_functionCall_setX']")).toHaveCount(
      1,
    );
  });

  test("can add extension twice", async ({ page }) => {
    const addExtensionButton = page.getByTestId("add-extension-button");
    await addExtensionButton.click();

    // click the first extension. the first image is the back-button
    const firstExtension = page.locator(".ReactModalPortal img").nth(2);

    await firstExtension.click();

    // add the extension again
    await addExtensionButton.click();
    await firstExtension.click();

    // ensure the custom block is added just once
    expect(page.locator("[data-id='example_functionCall_setX']")).toHaveCount(
      1,
    );
  });
});
