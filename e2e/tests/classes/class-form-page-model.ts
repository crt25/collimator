/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";

export class ClassFormPageModel {
  private static readonly classForm = '[data-testid="class-form"]';

  readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  get form() {
    return this.page.locator(ClassFormPageModel.classForm);
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

  getTeacherIds() {
    return this.inputs.teacherId.evaluate(() =>
      [...document.querySelectorAll('[role="option"]')].map((option) =>
        parseInt(option.getAttribute("data-value") || "0"),
      ),
    );
  }

  static async create(page: Page) {
    await page.waitForSelector(ClassFormPageModel.classForm);

    return new ClassFormPageModel(page);
  }
}
