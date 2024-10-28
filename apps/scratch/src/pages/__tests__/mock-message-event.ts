/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Page } from "playwright/test";

export class MockMessageEvent extends Event {
  source: Window;
  data: unknown;

  constructor(source: Window, data: unknown) {
    super("message");

    this.source = source;
    this.data = data;
  }
}

export const defineCustomMessageEvent = (page: Page): Promise<void> =>
  page.evaluate(() => {
    // @ts-expect-error - we add a class to the top level window object
    window.MockMessageEvent = class MockMessageEvent extends Event {
      constructor(source: Window, data: unknown) {
        super("message");

        (this as any).source = source;
        (this as any).data = data;
      }
    };
  });
