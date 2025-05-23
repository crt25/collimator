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

    await page.goto(`${baseURL!}/show?showStage`);

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

  test("loads the initial task blocks", async ({ page: pwPage }) => {
    const { page, task } = await TestTaskPage.load(pwPage);

    await expect(page.blocksOfCurrentTarget).toHaveCount(
      task.blocksOfMainTarget,
    );
  });
});
