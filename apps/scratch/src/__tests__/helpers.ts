import { Page } from "playwright/test";
import { expect } from "playwright-test-coverage";
import { ScratchCrtConfig } from "../types/scratch-vm-custom";
import { TestTask } from "./tasks";
import type { RpcMethodName } from "../../../../libraries/iframe-rpc/src/methods/rpc-method-names";

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

const getPostedMessageMethod = (message: unknown): RpcMethodName | undefined =>
  (message as { method?: RpcMethodName }).method;

/**
 * Waits until the app has posted a message for the given RPC method. A single
 * page action can post several messages (e.g. a solving load posts both the
 * loadTask response and a postTaskStarted activity), so callers match by
 * method rather than by message count or position.
 */
export const waitForPostedMessage = (
  pwPage: Page,
  method: RpcMethodName,
): Promise<unknown> =>
  pwPage.waitForFunction(
    (method) =>
      window.postedMessages.some(
        (m) => (m.message as { method?: string }).method === method,
      ),
    method,
  );

/** Returns the first posted message for the given RPC method, if any. */
export const findPostedMessage = async (
  pwPage: Page,
  method: RpcMethodName,
): Promise<unknown> => {
  const messages = await pwPage.evaluate(() => window.postedMessages);

  return messages.find((m) => getPostedMessageMethod(m.message) === method)
    ?.message;
};

/** Returns the RPC method of every message posted so far. */
export const getPostedMessageMethods = async (
  pwPage: Page,
): Promise<(RpcMethodName | undefined)[]> => {
  const messages = await pwPage.evaluate(() => window.postedMessages);

  return messages.map((m) => getPostedMessageMethod(m.message));
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

  await waitForPostedMessage(pwPage, "loadTask");

  const loadTaskResponse = await findPostedMessage(pwPage, "loadTask");

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
