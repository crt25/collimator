/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import {
  confirmationModal,
  confirmationModalConfirmButton,
} from "../../selectors";

export class ClassDetailPageModel {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  getActionsDropdownButton(classId: number | string) {
    return this.page.getByTestId(`class-${classId}-actions-dropdown-button`);
  }

  getDeleteButton(classId: number | string) {
    return this.page.getByTestId(`class-${classId}-delete-button`);
  }

  async deleteAndConfirm(classId: number | string): Promise<void> {
    await this.getActionsDropdownButton(classId).click();
    await this.getDeleteButton(classId).click();

    await this.page.waitForSelector(confirmationModal);
    await this.page
      .locator(confirmationModal)
      .locator(confirmationModalConfirmButton)
      .click();
  }

  static async create(page: Page, classId: number | string) {
    await page.waitForSelector(
      `[data-testid='class-${classId}-actions-dropdown-button']`,
    );

    return new ClassDetailPageModel(page);
  }
}
