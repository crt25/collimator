import { test, expect } from "playwright-test-coverage";
import {
  defineCustomMessageEvent,
  MockMessageEvent,
} from "./mock-message-event";
import { SolveTaskPage } from "./page-objects/solve-task";
import { TestTaskPage } from "./page-objects/test-task";
import { getExpectedBlockConfigButtonLabel } from "./helpers";
import { AssertionTaskPage } from "./page-objects/assertion-task";
import type { RpcMethodName } from "../../../../../libraries/iframe-rpc/src/methods/rpc-method-names";

declare global {
  interface Window {
    // we store posted messages on the window object instead of actually posting so we can assert on them
    postedMessages: { message: unknown; options: unknown }[];
    MockMessageEvent: typeof MockMessageEvent;
  }
}

test.describe("/solve", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await defineCustomMessageEvent(page);

    await page.addInitScript(() => {
      window.postedMessages = [];

      // @ts-expect-error - we mock the parent window
      window.parent = {
        postMessage: (message, options) => {
          window.postedMessages.push({ message, options });
        },
      };
    });

    await page.goto(`${baseURL!}/solve`);

    await page.waitForSelector("#root");
  });

  test("can select the stage", async ({ page: pwPage }) => {
    const page = await SolveTaskPage.load(pwPage);

    await page.selectStage();

    // motion blocks should not be visible
    expect(page.getBlockInToolbox("motion_movesteps")).toHaveCount(0);
  });

  test("can toggle fullscreen", async ({ page: pwPage }) => {
    const page = await SolveTaskPage.load(pwPage);

    expect(page.fullscreenButton).toHaveCount(1);
    await page.enableFullScreen();
    expect(page.fullscreenButton).toHaveCount(0);

    expect(page.unFullscreenButton).toHaveCount(1);
    await page.disableFullScreen();
    expect(page.unFullscreenButton).toHaveCount(0);
  });

  test("can get height via window.postMessage", async ({ page }) => {
    await page.evaluate(() => {
      const event = new window.MockMessageEvent(window.parent, {
        id: 0,
        method: "getHeight",
      });

      window.dispatchEvent(event);
    });

    await page.waitForFunction(() => window.postedMessages.length > 0);

    const messages = await page.evaluate(() => window.postedMessages);

    expect(messages).toHaveLength(1);

    expect(messages[0].message).toEqual({
      jsonrpc: "2.0",
      id: 0,
      method: "getHeight",
      result: expect.any(Number),
    });
  });

  test("can get submission via window.postMessage", async ({ page }) => {
    await TestTaskPage.load(page);

    await page.evaluate(() => {
      const event = new window.MockMessageEvent(window.parent, {
        id: 1,
        method: "getSubmission",
      });

      window.dispatchEvent(event);
    });

    await page.waitForFunction(() => window.postedMessages.length > 1);

    const messages = await page.evaluate(() => window.postedMessages);

    expect(messages).toHaveLength(2);

    expect(messages[1].message).toEqual({
      jsonrpc: "2.0",
      id: 1,
      method: "getSubmission",
      // blobs cannot be transferred, see https://github.com/puppeteer/puppeteer/issues/3722
      result: {
        file: {},
        passedTests: [],
        failedTests: [],
      },
    });
  });

  test("loads the initial task blocks", async ({ page: pwPage }) => {
    const { page, task } = await TestTaskPage.load(pwPage);

    await expect(page.blocksOfCurrentTarget).toHaveCount(
      task.blocksOfMainTarget,
    );
  });

  test("loads the allowed blocks correctly", async ({ page: pwPage }) => {
    const { page, task } = await TestTaskPage.load(pwPage);

    const { moveSteps, turnRight, goto } = page.enabledBlockConfigButtons;
    const { turnLeft } = page.disabledBlockConfigButtons;

    await expect(moveSteps).toHaveCount(1);
    await expect(turnRight).toHaveCount(1);
    await expect(goto).toHaveCount(1);

    await expect(turnLeft).toHaveCount(0);

    // then assert that the correct labels are shown
    await expect(moveSteps).toHaveText(
      getExpectedBlockConfigButtonLabel(task.crtConfig, "motion_movesteps"),
    );
    await expect(turnRight).toHaveText(
      getExpectedBlockConfigButtonLabel(task.crtConfig, "motion_turnright"),
    );
    await expect(goto).toHaveText(
      getExpectedBlockConfigButtonLabel(task.crtConfig, "motion_goto"),
    );
  });

  test("cannot open block config menu", async ({ page: pwPage }) => {
    const { page } = await TestTaskPage.load(pwPage);

    await page.openBlockConfig("motion_movesteps", { force: true });

    expect(page.blockConfigForm).toHaveCount(0);
  });

  test("reduces number of allowed blocks", async ({ page: pwPage }) => {
    const { page, task } = await TestTaskPage.load(pwPage);
    const moveStepsAllowedCount =
      task.crtConfig.allowedBlocks["motion_movesteps"]!;

    const { moveSteps } = page.enabledBlockConfigButtons;

    await expect(page.blocksOfCurrentTarget).toHaveCount(
      task.blocksOfMainTarget,
    );

    await expect(moveSteps).toHaveText(moveStepsAllowedCount.toString());

    await page.appendNewBlockTo(
      "motion_movesteps",
      page.taskBlocks.catActor.editableBlock,
    );

    await expect(page.blocksOfCurrentTarget).toHaveCount(
      task.blocksOfMainTarget + 1,
    );
    await expect(moveSteps).toHaveText((moveStepsAllowedCount - 1).toString());

    for (let i = 0; i < moveStepsAllowedCount - 1; i++) {
      await page.appendNewBlockTo(
        "motion_movesteps",
        page.taskBlocks.catActor.editableBlock,
      );
    }

    await expect(page.blocksOfCurrentTarget).toHaveCount(
      task.blocksOfMainTarget + moveStepsAllowedCount,
    );
    await expect(moveSteps).toHaveText("0");

    // now it should not be possible to add another block
    await page.appendNewBlockTo(
      "motion_movesteps",
      page.taskBlocks.catActor.editableBlock,
    );

    await expect(moveSteps).toHaveText("0");
    await expect(page.blocksOfCurrentTarget).toHaveCount(
      task.blocksOfMainTarget + moveStepsAllowedCount,
    );
  });

  test("removing student-added blocks increases the limit", async ({
    page: pwPage,
  }) => {
    const { page, task } = await TestTaskPage.load(pwPage);
    const moveStepsAllowedCount =
      task.crtConfig.allowedBlocks["motion_movesteps"]!;

    const { moveSteps } = page.enabledBlockConfigButtons;

    await expect(page.blocksOfCurrentTarget).toHaveCount(
      task.blocksOfMainTarget,
    );

    await page.appendNewBlockTo(
      "motion_movesteps",
      page.taskBlocks.catActor.editableBlock,
    );

    await expect(page.blocksOfCurrentTarget).toHaveCount(
      task.blocksOfMainTarget + 1,
    );
    await expect(moveSteps).toHaveText((moveStepsAllowedCount - 1).toString());

    await page.removeAllNonFrozenBlocks();

    await expect(page.blocksOfCurrentTarget).toHaveCount(
      task.blocksOfMainTarget - task.frozenBlocksOfMainTarget,
    );
    await expect(moveSteps).toHaveText(
      getExpectedBlockConfigButtonLabel(task.crtConfig, "motion_movesteps"),
    );
  });

  test("cannot remove frozen blocks", async ({ page: pwPage }) => {
    const { page } = await TestTaskPage.load(pwPage);

    await expect(page.taskBlocks.catActor.frozenBlock).toHaveCount(1);

    await page.removeBlock(page.taskBlocks.catActor.frozenBlock);

    await expect(page.taskBlocks.catActor.frozenBlock).toHaveCount(1);
  });

  test("cannot remove frozen but appendable blocks", async ({
    page: pwPage,
  }) => {
    const { page } = await TestTaskPage.load(pwPage);

    await expect(
      page.taskBlocks.catActor.visualTopOfAppendableStack,
    ).toHaveCount(1);

    await page.removeBlock(page.taskBlocks.catActor.visualTopOfAppendableStack);

    await expect(
      page.taskBlocks.catActor.visualTopOfAppendableStack,
    ).toHaveCount(1);
  });

  test("can prepend to editable stack", async ({ page: pwPage }) => {
    const { page } = await TestTaskPage.load(pwPage);

    const initialBlocksInStack = await page.countBlocksInSubStack(
      page.taskBlocks.catActor.editableBlock,
    );

    await page.prependNewBlockTo(
      "motion_goto",
      page.taskBlocks.catActor.editableBlock,
    );

    // nothing should be added to this stack
    await expect(
      page.countBlocksInSubStack(page.taskBlocks.catActor.editableBlock),
    ).resolves.toBe(initialBlocksInStack);
  });

  test("can append to editable stack", async ({ page: pwPage }) => {
    const { page } = await TestTaskPage.load(pwPage);

    const initialBlocksInStack = await page.countBlocksInSubStack(
      page.taskBlocks.catActor.editableBlock,
    );

    await page.appendNewBlockTo(
      "motion_goto",
      page.taskBlocks.catActor.editableBlock,
    );

    // nothing should be added to this stack
    await expect(
      page.countBlocksInSubStack(page.taskBlocks.catActor.editableBlock),
    ).resolves.toBe(initialBlocksInStack + 1);
  });

  test("cannot prepend to top of frozen but appendable stack", async ({
    page: pwPage,
  }) => {
    const { page } = await TestTaskPage.load(pwPage);

    const initialBlocksInStack = await page.countBlocksInSubStack(
      page.taskBlocks.catActor.visualTopOfAppendableStack,
    );

    await page.prependNewBlockTo(
      "motion_movesteps",
      page.taskBlocks.catActor.visualTopOfAppendableStack,
    );

    await expect(
      page.countBlocksInSubStack(
        page.taskBlocks.catActor.visualTopOfAppendableStack,
      ),
    ).resolves.toBe(initialBlocksInStack);
  });

  test("cannot append to top of frozen but appendable stack", async ({
    page: pwPage,
  }) => {
    const { page } = await TestTaskPage.load(pwPage);

    const initialBlocksInStack = await page.countBlocksInSubStack(
      page.taskBlocks.catActor.visualTopOfAppendableStack,
    );

    await page.appendNewBlockTo(
      "motion_movesteps",
      page.taskBlocks.catActor.visualTopOfAppendableStack,
    );

    await expect(
      page.countBlocksInSubStack(
        page.taskBlocks.catActor.visualTopOfAppendableStack,
      ),
    ).resolves.toBe(initialBlocksInStack);
  });

  test("can append to bottom of frozen but appendable stack", async ({
    page: pwPage,
  }) => {
    const { page } = await TestTaskPage.load(pwPage);

    const initialBlocksInStack = await page.countBlocksInSubStack(
      page.taskBlocks.catActor.visualTopOfAppendableStack,
    );

    await page.appendNewBlockTo(
      "motion_movesteps",
      page.taskBlocks.catActor.visualBottomOfAppendableStack,
    );

    await expect(
      page.countBlocksInSubStack(
        page.taskBlocks.catActor.visualTopOfAppendableStack,
      ),
    ).resolves.toBe(initialBlocksInStack + 1);
  });

  test("can append to empty slot in appendable stack", async ({
    page: pwPage,
  }) => {
    const { page } = await TestTaskPage.load(pwPage);

    const initialBlocksInStack = await page.countBlocksInSubStack(
      page.taskBlocks.catActor.insertableSlot,
    );

    await page.appendNewBlockTo(
      "motion_movesteps",
      page.taskBlocks.catActor.insertableSlot,
    );

    await expect(
      page.countBlocksInSubStack(page.taskBlocks.catActor.insertableSlot),
    ).resolves.toBe(initialBlocksInStack + 1);
  });

  test("cannot open task config", async ({ page: pwPage }) => {
    const { page } = await TestTaskPage.load(pwPage);

    await expect(page.openTaskConfigButton).toHaveCount(0);

    expect(page.taskConfigForm).toHaveCount(0);
  });

  test("removing initial blocks does not increase the limit", async ({
    page: pwPage,
  }) => {
    const { page, task } = await TestTaskPage.load(pwPage);

    const { moveSteps, turnRight } = page.enabledBlockConfigButtons;

    await expect(page.taskBlocks.catActor.editableBlock).toHaveCount(1);

    await page.removeBlock(page.taskBlocks.catActor.editableBlock);

    await expect(page.taskBlocks.catActor.editableBlock).toHaveCount(0);
    await expect(moveSteps).toHaveText(
      getExpectedBlockConfigButtonLabel(task.crtConfig, "motion_movesteps"),
    );
    await expect(turnRight).toHaveText(
      getExpectedBlockConfigButtonLabel(task.crtConfig, "motion_turnright"),
    );
  });

  test("loads assertions extension if task contains assertion blocks", async ({
    page: pwPage,
  }) => {
    const { page } = await AssertionTaskPage.load(pwPage);

    await expect(
      page.taskBlocks.catActor.visualTopOfAssertionStack,
    ).toHaveCount(1);

    await expect(
      page.disabledBlockConfigButtons.whenTaskFinishedRunning,
    ).toHaveCount(0);
    await expect(page.disabledBlockConfigButtons.assert).toHaveCount(0);
  });

  test("reports the correct numbers of assertions when failing", async ({
    page: pwPage,
  }) => {
    const { page } = await AssertionTaskPage.load(pwPage);

    await page.pressGreenFlag();

    await expect(page.assertionState.passed).toHaveText("0");
    await expect(page.assertionState.total).toHaveText("1");

    await pwPage.evaluate(() => {
      const event = new window.MockMessageEvent(window.parent, {
        id: 0,
        method: "getSubmission",
      });

      window.dispatchEvent(event);
    });

    await pwPage.waitForFunction(() => window.postedMessages.length > 2);

    const messages = await pwPage.evaluate(() => window.postedMessages);

    expect(messages).toHaveLength(3);

    expect(messages[2].message).toEqual({
      jsonrpc: "2.0",
      id: 0,
      method: "getSubmission",
      result: {
        file: {},
        failedTests: [
          {
            contextName: "Sprite1",
            identifier: "Sprite1$=AZYDuVf2OMO^acD9JwZ",
            name: "Unnamed Assertion",
          },
        ],
        passedTests: [],
      },
    });
  });

  test("reports the correct numbers of assertions when passing", async ({
    page: pwPage,
  }) => {
    const { page } = await AssertionTaskPage.load(pwPage);

    await expect(page.assertionState.passed).toHaveCount(0);

    // solve task
    for (let i = 0; i < 5; i++) {
      await page.appendNewBlockToBottomOfStack(
        "motion_movesteps",
        page.taskBlocks.catActor.visualTopOfEditableStack,
      );
    }

    await page.pressGreenFlag();

    await expect(page.assertionState.passed).toHaveText("1");
    await expect(page.assertionState.total).toHaveText("1");

    await pwPage.evaluate(() => {
      const event = new window.MockMessageEvent(window.parent, {
        id: 0,
        method: "getSubmission",
      });

      window.dispatchEvent(event);
    });

    await pwPage.waitForFunction(() => window.postedMessages.length > 2);

    await pwPage.waitForFunction(() =>
      window.postedMessages.some(
        (m) =>
          (m.message as { method?: RpcMethodName }).method === "getSubmission",
      ),
    );

    const messages = await pwPage.evaluate(() => window.postedMessages);

    const submissionMessage = messages.find(
      (m) =>
        (m.message as { method?: RpcMethodName }).method === "getSubmission",
    );

    expect(submissionMessage).toBeDefined();

    expect(submissionMessage!.message).toEqual({
      jsonrpc: "2.0",
      id: 0,
      method: "getSubmission",
      result: {
        file: {},
        passedTests: [
          {
            contextName: "Sprite1",
            identifier: "Sprite1$=AZYDuVf2OMO^acD9JwZ",
            name: "Unnamed Assertion",
          },
        ],
        failedTests: [],
      },
    });
  });

  test("resets to the initial state when running", async ({ page: pwPage }) => {
    const { page } = await AssertionTaskPage.load(pwPage);

    expect(await pwPage.evaluate(() => window.postedMessages)).toHaveLength(1);

    // solve task
    for (let i = 0; i < 5; i++) {
      await page.appendNewBlockToBottomOfStack(
        "motion_movesteps",
        page.taskBlocks.catActor.visualTopOfEditableStack,
      );
    }

    // run the project twice - by default scratch would not reset and the cat would
    // be at position x = 100, violating the assertion
    await page.pressGreenFlag();

    await pwPage.waitForTimeout(1000);

    await page.pressGreenFlag();

    await pwPage.waitForTimeout(1000);

    await expect(page.assertionState.passed).toHaveText("1");
    await expect(page.assertionState.total).toHaveText("1");
  });
});
