/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import { userList } from "../../selectors";
import { ListPageModel } from "../../page-models/list-page-model";
import { getItemIdFromTableTestId } from "../../helpers";

export class UserListPageModel extends ListPageModel {
  protected constructor(page: Page) {
    super(page, "user");
  }

  getNameElementByName(name: string) {
    return this.page
      .locator(`[data-testid^='${this.itemPrefix}'][data-testid$='-name']`)
      .getByText(name);
  }

  async getIdByName(name: string) {
    const elLocator = this.getNameElementByName(name);

    return getItemIdFromTableTestId(
      await elLocator.evaluate((el) =>
        el.closest("[data-testid$=-name]")!.getAttribute("data-testid"),
      ),
    );
  }

  getName(itemId: number | string) {
    return this.page.getByTestId(`${this.itemPrefix}-${itemId}-name`);
  }

  viewItem(itemId: number | string): Promise<void> {
    return this.getName(itemId).click();
  }

  static async create(page: Page) {
    await page.waitForSelector(userList);

    return new UserListPageModel(page);
  }
}
