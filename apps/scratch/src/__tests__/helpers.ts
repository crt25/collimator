import { Page } from "playwright/test";
import { expect } from "playwright-test-coverage";
import { ScratchCrtConfig } from "../types/scratch-vm-custom";
import { TestTask } from "./tasks";

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

export const loadTask = async (
  pwPage: Page,
  task: TestTask,
  expectError = false,
): Promise<void> => {
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
      method: "loadTask",
      params: {
        task,
        language: "en",
      },
    });

    window.dispatchEvent(event);
  }, url);

  // a solving student's load also posts a postTaskStarted activity, so match
  // the loadTask response by method rather than assuming it is the only message
  await pwPage.waitForFunction(() =>
    window.postedMessages.some(
      (m) => (m.message as { method?: string }).method === "loadTask",
    ),
  );

  const messages = await pwPage.evaluate(() => window.postedMessages);

  const loadTaskResponse = messages.find(
    (m) => (m.message as { method?: string }).method === "loadTask",
  )?.message;

  if (expectError) {
    expect(loadTaskResponse).toMatchObject({
      jsonrpc: "2.0",
      id: 0,
      method: "loadTask",
      error: expect.any(String),
    });
  } else {
    expect(loadTaskResponse).toEqual({
      jsonrpc: "2.0",
      id: 0,
      method: "loadTask",
      result: undefined,
    });
  }
};
