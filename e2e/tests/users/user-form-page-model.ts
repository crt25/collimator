/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import { FormPageModel } from "../../page-models/form-page-model";

export class UserFormPageModel extends FormPageModel {
  private static readonly classForm = '[data-testid="user-form"]';

  protected constructor(page: Page) {
    super(page);
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
