import { readFileSync } from "fs";
import { resolve } from "path";
import { test, expect } from "playwright-test-coverage";
import {
  defineCustomMessageEvent,
  MockMessageEvent,
} from "./mock-message-event";
import {
  getAllTargetBlocksSelector,
  getBlockConfigButtonSelector,
  getBlockConfigFormSelector,
  getBlockSelector,
  getFlyoutCanvasSelector,
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

    expect(messages).toHaveLength(2);

    expect(messages[1].message).toEqual({
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

    expect(messages).toHaveLength(2);

    expect(messages[1].message).toEqual({
      id: 0,
      type: "response",
      procedure: "getSubmission",
      // blobs cannot be transferred, see https://github.com/puppeteer/puppeteer/issues/3722
      result: {},
    });
  });

  test("loads the initial task blocks", async ({ page }) => {
    await expect(page.locator(getAllTargetBlocksSelector())).toHaveCount(2);
  });

  test("loads the allowed blocks correctly", async ({ page }) => {
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

    await expect(turnLeft).toHaveCount(0);

    // then assert that the correct labels are shown
    await expect(moveSteps).toHaveText("7");
    await expect(turnRight).toHaveText("2");
    await expect(goto).toHaveText("∞");

    // the rest isn't
    expect(
      page.locator(getBlockConfigButtonSelector("motion_turnleft")),
    ).toHaveCount(0);
  });

  test("cannot open block config menu", async ({ page }) => {
    const moveSteps = page.locator(
      getBlockConfigButtonSelector("motion_movesteps"),
    );

    await moveSteps.click();

    expect(page.locator(getBlockConfigFormSelector())).toHaveCount(0);
  });

  test("reduces number of allowed blocks", async ({ page }) => {
    const moveSteps = page.locator(
      getBlockConfigButtonSelector("motion_movesteps"),
    );

    await expect(page.locator(getAllTargetBlocksSelector())).toHaveCount(2);
    await expect(moveSteps).toHaveText("7");

    await page
      .locator(getBlockSelector("motion_movesteps"))
      // drag it to some block that is already on the stage
      .dragTo(page.locator("[data-id='@Z24?:3gFhIy;D;=NXM*']"));

    await expect(page.locator(getAllTargetBlocksSelector())).toHaveCount(3);
    await expect(moveSteps).toHaveText("6");

    for (let i = 0; i < 6; i++) {
      await page
        .locator(getBlockSelector("motion_movesteps"))
        // drag it to some block that is already on the stage
        .dragTo(page.locator("[data-id='@Z24?:3gFhIy;D;=NXM*']"));
    }

    await expect(page.locator(getAllTargetBlocksSelector())).toHaveCount(9);
    await expect(moveSteps).toHaveText("0");

    // now it should not be possible to add another block

    await page
      .locator(getBlockSelector("motion_movesteps"))
      // drag it to some block that is already on the stage
      .dragTo(page.locator("[data-id='@Z24?:3gFhIy;D;=NXM*']"), {
        // force the drag even if nothing happens
        force: true,
      });

    await expect(moveSteps).toHaveText("0");
    await expect(page.locator(getAllTargetBlocksSelector())).toHaveCount(9);
  });

  test("removing initial blocks does not increase the limit", async ({
    page,
  }) => {
    const moveSteps = page.locator(
      getBlockConfigButtonSelector("motion_movesteps"),
    );
    const turnRight = page.locator(
      getBlockConfigButtonSelector("motion_turnright"),
    );

    await expect(page.locator(getAllTargetBlocksSelector())).toHaveCount(2);

    await page
      .locator(getAllTargetBlocksSelector())
      .first()
      .dragTo(page.locator(getFlyoutCanvasSelector()));

    await expect(page.locator(getAllTargetBlocksSelector())).toHaveCount(1);
    await expect(moveSteps).toHaveText("7");
    await expect(turnRight).toHaveText("2");
  });

  test("removing student-added blocks increases the limit", async ({
    page,
  }) => {
    const moveSteps = page.locator(
      getBlockConfigButtonSelector("motion_movesteps"),
    );

    const initialIds = await page
      .locator(getAllTargetBlocksSelector())
      .evaluateAll((elements) =>
        elements.map((el) => el.getAttribute("data-id")),
      );

    expect(initialIds).toHaveLength(2);

    await page
      .locator(getBlockSelector("motion_movesteps"))
      // drag it to some block that is already on the stage
      .dragTo(page.locator("[data-id='@Z24?:3gFhIy;D;=NXM*']"));

    await expect(page.locator(getAllTargetBlocksSelector())).toHaveCount(3);
    await expect(moveSteps).toHaveText("6");

    while ((await page.locator(getAllTargetBlocksSelector()).count()) > 0) {
      await page
        .locator(getAllTargetBlocksSelector())
        .first()
        .dragTo(page.locator(getFlyoutCanvasSelector()), {
          force: true,
        });

      await page.waitForTimeout(1000);
    }

    await expect(page.locator(getAllTargetBlocksSelector())).toHaveCount(0);
    await expect(moveSteps).toHaveText("7");
  });
});
