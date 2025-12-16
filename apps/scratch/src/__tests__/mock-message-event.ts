/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page } from "playwright/test";

export class MockMessageEvent extends Event {
  readonly origin = "http://localhost:3101";

  source: Window;
  data: unknown;

  constructor(source: Window, data: unknown) {
    super("message");

    this.source = source;
    this.data = data;
  }
}

export const defineCustomMessageEvent = (page: Page): Promise<void> =>
  page.addInitScript(() => {
    // @ts-expect-error - we add a class to the top level window object
    window.MockMessageEvent = class MockMessageEvent extends Event {
      constructor(source: Window, data: unknown) {
        super("message");

        (this as any).source = source;
        (this as any).data = data;
        (this as any).origin = "http://localhost:3101";
      }
    };
  });
