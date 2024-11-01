import { readFileSync } from "fs";
import { resolve } from "path";
import { test, expect } from "playwright-test-coverage";
import {
  defineCustomMessageEvent,
  MockMessageEvent,
} from "./mock-message-event";
import { SolveTaskPage } from "./page-objects/solve-task";
import { TestTaskPage } from "./page-objects/test-task";

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

  test("can select the stage", async ({ page: pwPage }) => {
    const page = new SolveTaskPage(pwPage);

    await page.selectStage();

    // motion blocks should not be visible
    expect(page.getBlockInToolbox("motion_movesteps")).toHaveCount(0);
  });

  test("can toggle fullscreen", async ({ page: pwPage }) => {
    const page = new SolveTaskPage(pwPage);
    await page.enableFullScreen();

    expect(page.fullscreenButton).toHaveCount(0);

    await page.disableFullScreen();
    expect(page.unFullscreenButton).toHaveCount(0);
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

  test("loads the initial task blocks", async ({ page: pwPage }) => {
    const page = new SolveTaskPage(pwPage);

    await expect(page.blocksOfCurrentTarget).toHaveCount(9);
  });

  test("loads the allowed blocks correctly", async ({ page: pwPage }) => {
    const page = new TestTaskPage(pwPage);

    const { moveSteps, turnRight, goto } = page.enabledBlockConfigButtons;
    const { turnLeft } = page.disabledBlockConfigButtons;

    await expect(moveSteps).toHaveCount(1);
    await expect(turnRight).toHaveCount(1);
    await expect(goto).toHaveCount(1);

    await expect(turnLeft).toHaveCount(0);

    // then assert that the correct labels are shown
    await expect(moveSteps).toHaveText("7");
    await expect(turnRight).toHaveText("2");
    await expect(goto).toHaveText("∞");
  });

  test("cannot open block config menu", async ({ page: pwPage }) => {
    const page = new TestTaskPage(pwPage);

    await page.openBlockConfig("motion_movesteps", { force: true });

    expect(page.blockConfigForm).toHaveCount(0);
  });

  test("reduces number of allowed blocks", async ({ page: pwPage }) => {
    const page = new TestTaskPage(pwPage);

    const { moveSteps } = page.enabledBlockConfigButtons;

    await expect(page.blocksOfCurrentTarget).toHaveCount(9);
    await expect(moveSteps).toHaveText("7");

    await page.appendNewBlockTo(
      "motion_movesteps",
      page.taskBlocks.catActor.editableBlock,
    );

    await expect(page.blocksOfCurrentTarget).toHaveCount(10);
    await expect(moveSteps).toHaveText("6");

    for (let i = 0; i < 6; i++) {
      await page.appendNewBlockTo(
        "motion_movesteps",
        page.taskBlocks.catActor.editableBlock,
      );
    }

    await expect(page.blocksOfCurrentTarget).toHaveCount(16);
    await expect(moveSteps).toHaveText("0");

    // now it should not be possible to add another block
    await page.appendNewBlockTo(
      "motion_movesteps",
      page.taskBlocks.catActor.editableBlock,
    );

    await expect(moveSteps).toHaveText("0");
    await expect(page.blocksOfCurrentTarget).toHaveCount(16);
  });

  test("removing student-added blocks increases the limit", async ({
    page: pwPage,
  }) => {
    const page = new TestTaskPage(pwPage);

    const { moveSteps } = page.enabledBlockConfigButtons;

    await expect(page.blocksOfCurrentTarget).toHaveCount(9);

    await page.appendNewBlockTo(
      "motion_movesteps",
      page.taskBlocks.catActor.editableBlock,
    );

    await expect(page.blocksOfCurrentTarget).toHaveCount(10);
    await expect(moveSteps).toHaveText("6");

    await page.removeAllNonFrozenBlocks();

    await expect(page.blocksOfCurrentTarget).toHaveCount(7);
    await expect(moveSteps).toHaveText("7");
  });

  test("cannot remove frozen blocks", async ({ page: pwPage }) => {
    const page = new TestTaskPage(pwPage);

    await expect(page.taskBlocks.catActor.frozenBlock).toHaveCount(1);

    await page.removeBlock(page.taskBlocks.catActor.frozenBlock);

    await expect(page.taskBlocks.catActor.frozenBlock).toHaveCount(1);
  });

  test("cannot remove frozen but appendable blocks", async ({
    page: pwPage,
  }) => {
    const page = new TestTaskPage(pwPage);

    await expect(page.taskBlocks.catActor.topOfAppendableStack).toHaveCount(1);

    await page.removeBlock(page.taskBlocks.catActor.topOfAppendableStack);

    await expect(page.taskBlocks.catActor.topOfAppendableStack).toHaveCount(1);
  });

  test("can prepend to editable stack", async ({ page: pwPage }) => {
    const page = new TestTaskPage(pwPage);

    const initialBlocksInStack = await page.countBlocksInStack(
      page.taskBlocks.catActor.editableBlock,
    );

    await page.prependNewBlockTo(
      "motion_goto",
      page.taskBlocks.catActor.editableBlock,
    );

    // nothing should be added to this stack
    await expect(
      page.countBlocksInStack(page.taskBlocks.catActor.editableBlock),
    ).resolves.toBe(initialBlocksInStack);
  });

  test("can append to editable stack", async ({ page: pwPage }) => {
    const page = new TestTaskPage(pwPage);

    const initialBlocksInStack = await page.countBlocksInStack(
      page.taskBlocks.catActor.editableBlock,
    );

    await page.appendNewBlockTo(
      "motion_goto",
      page.taskBlocks.catActor.editableBlock,
    );

    // nothing should be added to this stack
    await expect(
      page.countBlocksInStack(page.taskBlocks.catActor.editableBlock),
    ).resolves.toBe(initialBlocksInStack + 1);
  });

  test("cannot prepend to top of frozen but appendable stack", async ({
    page: pwPage,
  }) => {
    const page = new TestTaskPage(pwPage);

    const initialBlocksInStack = await page.countBlocksInStack(
      page.taskBlocks.catActor.topOfAppendableStack,
    );

    await page.prependNewBlockTo(
      "motion_movesteps",
      page.taskBlocks.catActor.topOfAppendableStack,
    );

    await expect(
      page.countBlocksInStack(page.taskBlocks.catActor.topOfAppendableStack),
    ).resolves.toBe(initialBlocksInStack);
  });

  test("cannot append to top of frozen but appendable stack", async ({
    page: pwPage,
  }) => {
    const page = new TestTaskPage(pwPage);

    const initialBlocksInStack = await page.countBlocksInStack(
      page.taskBlocks.catActor.topOfAppendableStack,
    );

    await page.appendNewBlockTo(
      "motion_movesteps",
      page.taskBlocks.catActor.topOfAppendableStack,
    );

    await expect(
      page.countBlocksInStack(page.taskBlocks.catActor.topOfAppendableStack),
    ).resolves.toBe(initialBlocksInStack);
  });

  test("can append to bottom of frozen but appendable stack", async ({
    page: pwPage,
  }) => {
    const page = new TestTaskPage(pwPage);

    const initialBlocksInStack = await page.countBlocksInStack(
      page.taskBlocks.catActor.topOfAppendableStack,
    );

    await page.appendNewBlockTo(
      "motion_movesteps",
      page.taskBlocks.catActor.bottomOfAppendableStack,
    );

    await expect(
      page.countBlocksInStack(page.taskBlocks.catActor.topOfAppendableStack),
    ).resolves.toBe(initialBlocksInStack + 1);
  });

  test("can append to empty slot in appendable stack", async ({
    page: pwPage,
  }) => {
    const page = new TestTaskPage(pwPage);

    const initialBlocksInStack = await page.countBlocksInStack(
      page.taskBlocks.catActor.insertableSlot,
    );

    await page.appendNewBlockTo(
      "motion_movesteps",
      page.taskBlocks.catActor.insertableSlot,
    );

    await expect(
      page.countBlocksInStack(page.taskBlocks.catActor.insertableSlot),
    ).resolves.toBe(initialBlocksInStack + 1);
  });

  test("cannot open task config", async ({ page: pwPage }) => {
    const page = new TestTaskPage(pwPage);

    await expect(page.openTaskConfigButton).toHaveCount(0);

    expect(page.taskConfigForm).toHaveCount(0);
  });

  test("removing initial blocks does not increase the limit", async ({
    page: pwPage,
  }) => {
    const page = new TestTaskPage(pwPage);

    const { moveSteps, turnRight } = page.enabledBlockConfigButtons;

    await expect(page.taskBlocks.catActor.editableBlock).toHaveCount(1);

    await page.removeBlock(page.taskBlocks.catActor.editableBlock);

    await expect(page.taskBlocks.catActor.editableBlock).toHaveCount(0);
    await expect(moveSteps).toHaveText("7");
    await expect(turnRight).toHaveText("2");
  });
});
