/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";

export class UserFormPageModel {
  private static readonly classForm = '[data-testid="user-form"]';

  readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  get form() {
    return this.page.locator(UserFormPageModel.classForm);
  }

  get inputs() {
    return {
      name: this.form.locator('[data-testid="name"]'),
      email: this.form.locator('[data-testid="email"]'),
      type: this.form.locator('[data-testid="type"]'),
    };
  }

  get submitButton() {
    return this.form.locator('[data-testid="submit"]');
  }

  static async create(page: Page) {
    await page.waitForSelector(UserFormPageModel.classForm);

    return new UserFormPageModel(page);
  }
}
