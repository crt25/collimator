/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import {
  confirmationModal,
  confirmationModalConfirmButton,
} from "../selectors";

export abstract class ListPageModel {
  protected readonly itemPrefix: string;
  protected readonly page: Page;

  protected constructor(page: Page, itemPrefix: string) {
    this.page = page;
    this.itemPrefix = itemPrefix;
  }

  getItemActions(itemId: number | string) {
    return this.page.getByTestId(`${this.itemPrefix}-${itemId}-actions`);
  }

  getItemActionsDropdownButton(itemId: number | string) {
    return this.page.getByTestId(
      `${this.itemPrefix}-${itemId}-actions-dropdown-button`,
    );
  }

  getDeleteItemButton(itemId: number | string) {
    return this.page.getByTestId(`${this.itemPrefix}-${itemId}-delete-button`);
  }

  editItem(itemId: number | string): Promise<void> {
    return this.page
      .getByTestId(`${this.itemPrefix}-${itemId}-edit-button`)
      .click();
  }

  createItem(): Promise<void> {
    return this.page.getByTestId(`${this.itemPrefix}-create-button`).click();
  }

  async deleteItem(itemId: number | string): Promise<void> {
    await this.getItemActionsDropdownButton(itemId).click();
    await this.getDeleteItemButton(itemId).click();

    await this.page.waitForSelector(confirmationModal);
    await this.page
      .locator(confirmationModal)
      .locator(confirmationModalConfirmButton)
      .click();
  }
}
