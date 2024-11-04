import { readFileSync } from "fs";
import { resolve } from "path";
import { test, expect } from "playwright-test-coverage";
import {
  defineCustomMessageEvent,
  MockMessageEvent,
} from "./mock-message-event";
import { TestTaskPage } from "./page-objects/test-task";

const testTaskEditable = readFileSync(
  // eslint-disable-next-line no-undef
  resolve(__dirname, "test-task-editable.zip"),
);

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
        body: testTaskEditable,
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

  test("removing initial blocks does not increase the limit", async ({
    page: pwPage,
  }) => {
    const page = new TestTaskPage(pwPage);

    const { moveSteps, turnRight } = page.enabledBlockConfigButtons;

    await expect(page.blocksOfCurrentTarget).toHaveCount(2);

    await page.blocksOfCurrentTarget.first().dragTo(page.toolbox);

    await expect(page.blocksOfCurrentTarget).toHaveCount(1);
    await expect(moveSteps).toHaveText("7");
    await expect(turnRight).toHaveText("2");
  });
});
