import { readFileSync } from "fs";
import { resolve } from "path";
import { test, expect } from "playwright-test-coverage";
import {
  defineCustomMessageEvent,
  MockMessageEvent,
} from "./mock-message-event";
import {
  getBlockConfigBlockLimitInputSelector,
  getBlockConfigButtonSelector,
  getBlockConfigCanBeUsedCheckboxSelector,
  getBlockConfigFormSubmitButtonSelector,
  getBlockConfigHasBlockLimitCheckboxSelector,
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
    const moveSteps = page.locator(
      getBlockConfigButtonSelector("motion_movesteps"),
    );

    const turnRight = page.locator(
      getBlockConfigButtonSelector("motion_turnright"),
    );

    const goto = page.locator(getBlockConfigButtonSelector("motion_goto"));

    const turnLeft = page.locator(
      getBlockConfigButtonSelector("motion_turnleft"),
    );

    await expect(moveSteps).toHaveCount(1);
    await expect(turnRight).toHaveCount(1);
    await expect(goto).toHaveCount(1);

    await expect(turnLeft).toHaveCount(1);

    // then assert that the correct labels are shown
    await expect(moveSteps).toHaveText("7");
    await expect(turnRight).toHaveText("2");
    await expect(goto).toHaveText("∞");

    await expect(turnLeft).toHaveText("0");
  });

  test("can update the block config to allow an arbitrary number of a given block", async ({
    page,
  }) => {
    const configButton = page.locator(
      getBlockConfigButtonSelector("motion_movesteps"),
    );

    // open modal
    await configButton.click();

    // check the checkbox that allows the block to be used
    await page.locator(getBlockConfigCanBeUsedCheckboxSelector()).click();

    // submit the form
    await page.locator(getBlockConfigFormSubmitButtonSelector()).click();

    // ensure the block's label is updated
    await expect(configButton).toHaveText("∞");

    // open the modal again
    await configButton.click();

    // uncheck the checkbox that allows the block to be used
    await page.locator(getBlockConfigCanBeUsedCheckboxSelector()).click();

    // submit the form
    await page.locator(getBlockConfigFormSubmitButtonSelector()).click();

    // ensure the block's label is updated
    await expect(configButton).toHaveText("0");
  });

  test("can update the block config to allow an a fixed number of a given block", async ({
    page,
  }) => {
    const configButton = page.locator(
      getBlockConfigButtonSelector("motion_movesteps"),
    );

    // open modal
    await configButton.click();

    // check the checkbox that allows the block to be used
    await page.locator(getBlockConfigCanBeUsedCheckboxSelector()).click();

    // check the checkbox that allows the block to be used a limited number of times
    await page.locator(getBlockConfigHasBlockLimitCheckboxSelector()).click();

    // set the block limit to 5
    await page.locator(getBlockConfigBlockLimitInputSelector()).fill("5");

    // submit the form
    await page.locator(getBlockConfigFormSubmitButtonSelector()).click();

    // ensure the block's label is updated
    await expect(configButton).toHaveText("5");

    // open the modal again
    await configButton.click();

    // uncheck the checkbox that allows the block to be used
    await page.locator(getBlockConfigCanBeUsedCheckboxSelector()).click();

    // submit the form
    await page.locator(getBlockConfigFormSubmitButtonSelector()).click();

    // ensure the block's label is updated
    await expect(configButton).toHaveText("0");
  });

  test("can add extension", async ({ page }) => {
    const addExtensionButton = page.getByTestId("add-extension-button");
    await addExtensionButton.click();

    // click the first extension. the first image is the back-button
    const firstExtension = page.locator(".ReactModalPortal img").nth(2);

    await firstExtension.click();

    // ensure the custom block is added
    await expect(
      page.locator("[data-id='example_functionCall_setX']"),
    ).toHaveCount(1);
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
    await expect(
      page.locator("[data-id='example_functionCall_setX']"),
    ).toHaveCount(1);
  });
});
