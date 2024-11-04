import { test, expect } from "playwright-test-coverage";
import {
  defineCustomMessageEvent,
  MockMessageEvent,
} from "./mock-message-event";
import { TestTaskPage } from "./page-objects/test-task";
import { EditTaskPage, Extension } from "./page-objects/edit-task";
import { getExpectedBlockConfigButtonLabel } from "./helpers";

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

  test("can load task via window.postMessage", async ({ page: pwPage }) => {
    const { page, task } = await TestTaskPage.load(pwPage);

    // check the block config buttons
    const { moveSteps, turnRight, goto } = page.enabledBlockConfigButtons;
    const { turnLeft } = page.disabledBlockConfigButtons;

    await expect(moveSteps).toHaveCount(1);
    await expect(turnRight).toHaveCount(1);
    await expect(goto).toHaveCount(1);

    await expect(turnLeft).toHaveCount(1);

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

    await expect(turnLeft).toHaveText(
      getExpectedBlockConfigButtonLabel(task.crtConfig, "motion_turnleft"),
    );

    // check the freeze buttons
    const editableStackButton = page.getBlockFreezeButton(
      page.taskBlocks.catActor.topOfEditableStack,
    );
    const frozenStackButton = page.getBlockFreezeButton(
      page.taskBlocks.catActor.topOfFrozenStack,
    );
    const appendableStackButton = page.getBlockFreezeButton(
      page.taskBlocks.catActor.visualTopOfAppendableStack,
    );

    await expect(editableStackButton).toHaveText("✎");
    await expect(frozenStackButton).toHaveText("🛇");
    await expect(appendableStackButton).toHaveText("+");
  });

  test("can update the block config to allow an arbitrary number of a given block", async ({
    page: pwPage,
  }) => {
    const page = new EditTaskPage(pwPage);
    const configButton = page.getBlockConfigButton("motion_movesteps");

    // open modal
    await configButton.click();

    // check the checkbox that allows the block to be used
    await page.blockConfigFormElements.canBeUsedCheckbox.click();

    // submit the form
    await page.blockConfigFormElements.submitButton.click();

    // ensure the block's label is updated
    await expect(configButton).toHaveText("∞");

    // open the modal again
    await configButton.click();

    // uncheck the checkbox that allows the block to be used
    await page.blockConfigFormElements.canBeUsedCheckbox.click();

    await page.blockConfigFormElements.submit();

    // ensure the block's label is updated
    await expect(configButton).toHaveText("0");
  });

  test("can update the block config to allow an a fixed number of a given block", async ({
    page: pwPage,
  }) => {
    const page = new EditTaskPage(pwPage);
    const configButton = page.getBlockConfigButton("motion_movesteps");

    // open modal
    await configButton.click();

    // check the checkbox that allows the block to be used
    await page.blockConfigFormElements.canBeUsedCheckbox.click();

    // check the checkbox that allows the block to be used a limited number of times
    await page.blockConfigFormElements.hasBlockLimitCheckbox.click();

    // set the block limit to 5
    await page.blockConfigFormElements.blockLimitInput.fill("5");

    // submit the form
    await page.blockConfigFormElements.submitButton.click();

    // ensure the block's label is updated
    await expect(configButton).toHaveText("5");

    // open the modal again
    await configButton.click();

    // uncheck the checkbox that allows the block to be used
    await page.blockConfigFormElements.canBeUsedCheckbox.click();

    await page.blockConfigFormElements.submit();

    // ensure the block's label is updated
    await expect(configButton).toHaveText("0");
  });

  test("can load assertions extension", async ({ page: pwPage }) => {
    const page = new EditTaskPage(pwPage);

    await page.addExtensionButton.click();

    await page.loadExtension(Extension.Assertions);

    // ensure the extension blocks are added
    await expect(
      page.getBlockInToolbox("assertions_event_whenTaskFinishedRunning"),
    ).toHaveCount(1);

    await expect(page.getBlockInToolbox("assertions_noop_assert")).toHaveCount(
      1,
    );
  });

  test("can load assertion extension twice", async ({ page: pwPage }) => {
    const page = new EditTaskPage(pwPage);

    await page.addExtensionButton.click();

    await page.loadExtension(Extension.Assertions);

    // add the extension again
    await page.addExtensionButton.click();
    await page.loadExtension(1);

    // ensure the custom blocks are added just once
    await expect(
      page.getBlockInToolbox("assertions_event_whenTaskFinishedRunning"),
    ).toHaveCount(1);
  });

  test("can use button to allow the usage of all blocks", async ({
    page: pwPage,
  }) => {
    const page = new EditTaskPage(pwPage);

    const moveSteps = page.getBlockConfigButton("motion_movesteps");
    const glideTo = page.getBlockConfigButton("motion_glideto");

    await expect(moveSteps).toHaveText("0");
    await expect(glideTo).toHaveText("0");

    await page.openTaskConfig();

    await page.taskConfigFormElements.allowAllBlocksButton.click();
    await page.taskConfigFormElements.submit.click();

    // form is no longer visible
    await expect(page.taskConfigForm).toHaveCount(0);

    await expect(moveSteps).toHaveText("∞");
    await expect(glideTo).toHaveText("∞");
  });

  test("can use button to allow the usage of no blocks", async ({
    page: pwPage,
  }) => {
    const page = new EditTaskPage(pwPage);

    const moveSteps = page.getBlockConfigButton("motion_movesteps");
    const goto = page.getBlockConfigButton("motion_goto");

    // open modal
    await moveSteps.click();

    // check the checkbox that allows the block to be used
    await page.blockConfigFormElements.canBeUsedCheckbox.click();

    // check the checkbox that allows the block to be used a limited number of times
    await page.blockConfigFormElements.hasBlockLimitCheckbox.click();

    // set the block limit to 5
    await page.blockConfigFormElements.blockLimitInput.fill("5");

    // submit the form
    await page.blockConfigFormElements.submitButton.click();

    // ensure the block's label is updated
    await expect(moveSteps).toHaveText("5");

    // ensure other labels did not change
    await expect(goto).toHaveText("0");

    await page.openTaskConfig();

    await page.taskConfigFormElements.allowNoBlocksButton.click();
    await page.taskConfigFormElements.submit.click();

    // form is no longer visible
    await expect(page.taskConfigForm).toHaveCount(0);

    await expect(moveSteps).toHaveText("0");
    await expect(goto).toHaveText("0");
  });

  test("can toggle freeze mode of task blocks", async ({ page: pwPage }) => {
    const { page } = await TestTaskPage.load(pwPage);

    const editableStackButton = page.getBlockFreezeButton(
      page.taskBlocks.catActor.topOfEditableStack,
    );

    await expect(editableStackButton).toHaveText("✎");
    await editableStackButton.click();
    await expect(editableStackButton).toHaveText("🛇");
    await editableStackButton.click();
    await expect(editableStackButton).toHaveText("+");
    await editableStackButton.click();
    await expect(editableStackButton).toHaveText("✎");
  });

  test("can prepend blocks to all stacks", async ({ page: pwPage }) => {
    const { page } = await TestTaskPage.load(pwPage);

    const stacks = [
      page.taskBlocks.catActor.topOfEditableStack,
      page.taskBlocks.catActor.topOfFrozenStack,
      page.taskBlocks.catActor.visualTopOfAppendableStack,
    ];

    for (const stack of stacks) {
      const blockCount = await page.countBlocksInParentStack(stack);

      await page.prependNewBlockTo("motion_movesteps", stack);

      expect(await page.countBlocksInParentStack(stack)).toBe(blockCount + 1);
    }
  });
});
