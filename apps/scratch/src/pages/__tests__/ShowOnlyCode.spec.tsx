import { test, expect } from "playwright-test-coverage";
import {
  defineCustomMessageEvent,
  MockMessageEvent,
} from "./mock-message-event";
import { SolveTaskPage } from "./page-objects/solve-task";
import { TestTaskPage } from "./page-objects/test-task";

declare global {
  interface Window {
    // we store posted messages on the window object instead of actually posting so we can assert on them
    postedMessages: { message: unknown; options: unknown }[];
    MockMessageEvent: typeof MockMessageEvent;
  }
}

test.describe("/show", () => {
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

    await page.goto(`${baseURL!}/show`);

    await page.waitForSelector("#root");

    await defineCustomMessageEvent(page);
  });

  test("does not show stage", async ({ page: pwPage }) => {
    const page = new SolveTaskPage(pwPage);

    expect(page.stage).toHaveCount(0);
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

  test("loads the initial task blocks", async ({ page: pwPage }) => {
    const { page, task } = await TestTaskPage.load(pwPage);

    await expect(page.blocksOfCurrentTarget).toHaveCount(
      task.blocksOfMainTarget,
    );
  });

  test("cannot move blocks", async ({ page: pwPage }) => {
    const { page } = await TestTaskPage.load(pwPage);

    const parentBefore = await page.taskBlocks.catActor.editableBlock.evaluate(
      (el) => el.closest(".blocklyDraggable"),
    );

    // ensure the block has a parent
    expect(parentBefore).not.toBeNull();

    await page.moveBlock(
      page.taskBlocks.catActor.editableBlock,
      page.blockCanvas,
      {
        x: 0,
        y: 0,
      },
    );

    // ensure the block has not moved
    const parentAfter = await page.taskBlocks.catActor.editableBlock.evaluate(
      (el) => el.closest(".blocklyDraggable"),
    );

    // ensure the parent is the same before and after
    expect(parentBefore).toEqual(parentAfter);
  });
});
