/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";

const pseudonymInputTestId = "pseudonym-input";

export class JoinAnonymousSessionPageModel {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  get pseudonymInput() {
    return this.page.getByTestId(pseudonymInputTestId);
  }

  async submit() {
    await this.page.getByTestId("pseudonym-submit-button").click();

    return this.page.waitForSelector("[data-testid='join-session-button']");
  }

  joinSession() {
    return this.page.getByTestId("join-session-button").click();
  }

  static async create(page: Page) {
    await page.waitForSelector(`[data-testid="${pseudonymInputTestId}"]`);

    return new JoinAnonymousSessionPageModel(page);
  }
}
