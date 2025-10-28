import { test, expect } from "playwright-test-coverage";
import {
  defineCustomMessageEvent,
  MockMessageEvent,
} from "./mock-message-event";
import { TestTaskPage } from "./page-objects/test-task";
import { EditTaskPage, Extension } from "./page-objects/edit-task";
import { getExpectedBlockConfigButtonLabel } from "./helpers";
import { AssertionTaskPage } from "./page-objects/assertion-task";

declare global {
  interface Window {
    // we store posted messages on the window object instead of actually posting so we can assert on them
    postedMessages: { message: unknown; options: unknown }[];
    MockMessageEvent: typeof MockMessageEvent;
  }
}

test.describe("/edit", () => {
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

    await page.goto(`${baseURL!}/edit`);

    await page.waitForSelector("#root");
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

  test("can export task via window.postMessage", async ({ page }) => {
    await TestTaskPage.load(page);

    await page.evaluate(() => {
      const event = new window.MockMessageEvent(window.parent, {
        id: 0,
        method: "exportTask",
      });

      window.dispatchEvent(event);
    });

    await page.waitForFunction(() => window.postedMessages.length > 1);

    const messages = await page.evaluate(() => window.postedMessages);

    expect(messages).toHaveLength(2);

    expect(messages[1].message).toEqual({
      jsonrpc: "2.0",
      id: 0,
      method: "exportTask",
      // blobs cannot be transferred, see https://github.com/puppeteer/puppeteer/issues/3722
      result: {
        file: {},
        initialSolution: {
          failedTests: [],
          passedTests: [],
          file: {},
        },
      },
    });
  });

  test("can get task via window.postMessage", async ({ page }) => {
    await TestTaskPage.load(page);

    await page.evaluate(() => {
      const event = new window.MockMessageEvent(window.parent, {
        id: 0,
        method: "getTask",
      });

      window.dispatchEvent(event);
    });

    await page.waitForFunction(() => window.postedMessages.length > 1);

    const messages = await page.evaluate(() => window.postedMessages);

    expect(messages).toHaveLength(2);

    expect(messages[1].message).toEqual({
      jsonrpc: "2.0",
      id: 0,
      method: "getTask",
      // blobs cannot be transferred, see https://github.com/puppeteer/puppeteer/issues/3722
      result: {
        file: {},
        initialSolution: {
          failedTests: [],
          passedTests: [],
          file: {},
        },
      },
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
      page.taskBlocks.catActor.visualTopOfEditableStack,
    );
    const frozenStackButton = page.getBlockFreezeButton(
      page.taskBlocks.catActor.topOfFrozenStack,
    );
    const appendableStackButton = page.getBlockFreezeButton(
      page.taskBlocks.catActor.visualTopOfAppendableStack,
    );

    await expect(editableStackButton).toHaveText("✍️");
    await expect(frozenStackButton).toHaveText("🔒");
    await expect(appendableStackButton).toHaveText("+");
  });

  test("can update the block config to allow an arbitrary number of a given block", async ({
    page: pwPage,
  }) => {
    const page = await EditTaskPage.load(pwPage);
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
    const page = await EditTaskPage.load(pwPage);
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
    const page = await EditTaskPage.load(pwPage);

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
    const page = await EditTaskPage.load(pwPage);

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
    const page = await EditTaskPage.load(pwPage);

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
    const page = await EditTaskPage.load(pwPage);

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

    await page.scrollBlockIntoView(
      page.taskBlocks.catActor.visualTopOfEditableStack,
    );

    const editableStackButton = page.getBlockFreezeButton(
      page.taskBlocks.catActor.visualTopOfEditableStack,
    );

    await expect(editableStackButton).toHaveText("✍️");
    await editableStackButton.click();
    await expect(editableStackButton).toHaveText("🔒");
    await editableStackButton.click();
    await expect(editableStackButton).toHaveText("+");
    await editableStackButton.click();
    await expect(editableStackButton).toHaveText("✍️");
  });

  test("can prepend blocks to all stacks", async ({ page: pwPage }) => {
    const { page } = await TestTaskPage.load(pwPage);

    const stacks = [
      page.taskBlocks.catActor.visualTopOfEditableStack,
      page.taskBlocks.catActor.topOfFrozenStack,
      page.taskBlocks.catActor.visualTopOfAppendableStack,
    ];

    for (const stack of stacks) {
      const blockCount = await page.countBlocksInParentStack(stack);

      await page.prependNewBlockTo("motion_movesteps", stack);

      expect(await page.countBlocksInParentStack(stack)).toBe(blockCount + 1);
    }
  });

  test("does not reset to the initial state when running", async ({
    page: pwPage,
  }) => {
    const editPage = await EditTaskPage.load(pwPage);
    const { page } = await AssertionTaskPage.load(pwPage);

    await expect(page.assertionState.passed).toHaveCount(0);

    expect(await pwPage.evaluate(() => window.postedMessages)).toHaveLength(1);

    // solve task
    for (let i = 0; i < 5; i++) {
      await page.appendNewBlockToBottomOfStack(
        "motion_movesteps",
        page.taskBlocks.catActor.visualTopOfEditableStack,
      );
    }

    // run the project once with assertions disabled
    await page.pressGreenFlag();

    // then, enable assertions
    await editPage.enableAssertions();

    // and run the project again. we expect the first run to persist and therefore
    // the assertions to fail
    await page.pressGreenFlag();

    await expect(page.assertionState.passed).toHaveText("0");
    await expect(page.assertionState.total).toHaveText("1");

    // no progress should be reported in edit mode
    expect(await pwPage.evaluate(() => window.postedMessages)).toHaveLength(1);
  });

  test("resets to the initial state when running in assertion mode", async ({
    page: pwPage,
  }) => {
    const editPage = await EditTaskPage.load(pwPage);
    const { page } = await AssertionTaskPage.load(pwPage);

    await expect(page.assertionState.passed).toHaveCount(0);

    expect(await pwPage.evaluate(() => window.postedMessages)).toHaveLength(1);

    // solve task
    for (let i = 0; i < 4; i++) {
      await page.appendNewBlockToBottomOfStack(
        "motion_movesteps",
        page.taskBlocks.catActor.visualTopOfEditableStack,
      );
    }

    // enable assertions
    await editPage.enableAssertions();

    // and run the project.
    await page.pressGreenFlag();

    // since we are missing one move steps, this should fail
    await expect(page.assertionState.passed).toHaveText("0");
    await expect(page.assertionState.total).toHaveText("1");

    // however, after adding one more it should pass.
    // note that without a reset, it will fail.
    await page.appendNewBlockToBottomOfStack(
      "motion_movesteps",
      page.taskBlocks.catActor.visualTopOfEditableStack,
    );

    await page.pressGreenFlag();

    await expect(page.assertionState.passed).toHaveText("1");
    await expect(page.assertionState.total).toHaveText("1");

    // no progress should be reported in edit mode
    expect(await pwPage.evaluate(() => window.postedMessages)).toHaveLength(1);

    // when disabling assertions, the state should disappear
    await editPage.disableAssertions();

    await expect(page.assertionState.passed).toHaveCount(0);
    await expect(page.assertionState.total).toHaveCount(0);
  });

  test("can disable assertion mode", async ({ page: pwPage }) => {
    const editPage = await EditTaskPage.load(pwPage);
    const { page } = await AssertionTaskPage.load(pwPage);

    await expect(page.assertionState.passed).toHaveCount(0);

    // enable assertions
    await editPage.enableAssertions();

    // and run the project.
    await page.pressGreenFlag();

    // since we did not solve the task, this should fail
    await expect(page.assertionState.passed).toHaveText("0");
    await expect(page.assertionState.total).toHaveText("1");

    // disable assertions should make the assertion state disappear
    await editPage.disableAssertions();
    await expect(page.assertionState.passed).toHaveCount(0);
    await expect(page.assertionState.total).toHaveCount(0);

    // when adding a block and running the project four times
    // we should be in the asserted state after a firth and final run
    await page.appendNewBlockToBottomOfStack(
      "motion_movesteps",
      page.taskBlocks.catActor.visualTopOfEditableStack,
    );

    for (let i = 0; i < 4; i++) {
      await page.pressGreenFlag();
    }

    // hence, if we enable assertions now and run the project,
    // we should succeed
    await editPage.enableAssertions();
    await page.pressGreenFlag();

    await expect(page.assertionState.passed).toHaveText("1");
    await expect(page.assertionState.total).toHaveText("1");
  });
});
