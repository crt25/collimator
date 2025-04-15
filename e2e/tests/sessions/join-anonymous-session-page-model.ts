/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";

export class JoinAnonymousSessionPageModel {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  joinSession() {
    return this.page.getByTestId("join-session-button").click();
  }

  static async create(page: Page) {
    await page.waitForSelector("[data-testid='join-session-button']");

    return new JoinAnonymousSessionPageModel(page);
  }
}
