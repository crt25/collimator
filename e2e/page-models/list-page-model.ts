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

  getSessionLinkButton(itemId: number | string) {
    return this.page.getByTestId(
      `${this.itemPrefix}-${itemId}-copy-session-link-button`,
    );
  }

  editItem(itemId: number | string): Promise<void> {
    return this.page
      .getByTestId(`${this.itemPrefix}-${itemId}-edit-button`)
      .click();
  }

  createItem(): Promise<void> {
    return this.page.getByTestId(`${this.itemPrefix}-create-button`).click();
  }

  abstract viewItem(itemId: number | string): Promise<void>;

  async deleteItem(itemId: number | string): Promise<void> {
    await this.getItemActionsDropdownButton(itemId).click();
    await this.getDeleteItemButton(itemId).click();

    await this.page.waitForSelector(confirmationModal);
    await this.page
      .locator(confirmationModal)
      .locator(confirmationModalConfirmButton)
      .click();
  }

  async getSessionLink(itemId: number | string): Promise<string> {
    await this.page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);

    await this.getItemActionsDropdownButton(itemId).click();
    await this.getSessionLinkButton(itemId).click();

    return this.page.evaluate(() => navigator.clipboard.readText());
  }
}
