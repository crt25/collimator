import { Page } from "playwright/test";
import { ScratchCrtConfig } from "../../types/scratch-vm-custom";
import { TestTask } from "./tasks";
import { expect } from "playwright-test-coverage";

export const getExpectedBlockConfigButtonLabel = (
  crtConfig: ScratchCrtConfig,
  opcode: string,
): string => {
  const count = crtConfig.allowedBlocks[opcode] ?? 0;

  if (count === -1) {
    return "∞";
  }

  return count.toString();
};

let idx = 0;

export const loadTask = async (pwPage: Page, task: TestTask): Promise<void> => {
  const filename = idx + ".sb3";
  idx += 1;

  const url = `https://example.com/${filename}`;

  await pwPage.route(url, async (route) =>
    route.fulfill({
      body: await task.file,
      contentType: "application/x.scratch.sb3",
      status: 200,
    }),
  );

  await pwPage.evaluate(async (url) => {
    const task = await fetch(url).then((response) => response.blob());

    const event = new window.MockMessageEvent(window.parent, {
      id: 0,
      type: "request",
      procedure: "loadTask",
      arguments: task,
    });

    window.dispatchEvent(event);
  }, url);

  await pwPage.waitForFunction(() => window.postedMessages.length > 0);

  const messages = await pwPage.evaluate(() => window.postedMessages);

  expect(messages).toHaveLength(1);

  expect(messages[0].message).toEqual({
    id: 0,
    type: "response",
    procedure: "loadTask",
    result: undefined,
  });
};
