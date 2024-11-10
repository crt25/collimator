/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";

export class CreateClassForm {
  private static readonly classForm = '[data-testid="class-form"]';

  readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  get form() {
    return this.page.locator(CreateClassForm.classForm);
  }

  get inputs() {
    return {
      className: this.form.locator('[data-testid="name"]'),
      teacherId: this.form.locator('[data-testid="teacherId"]'),
    };
  }

  get submitButton() {
    return this.form.locator('[data-testid="submit"]');
  }

  static async create(page: Page) {
    await page.waitForSelector(CreateClassForm.classForm);

    return new CreateClassForm(page);
  }
}
