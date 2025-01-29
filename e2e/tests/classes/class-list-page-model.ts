/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import { classList } from "../../selectors";
import { ListPageModel } from "../../page-models/list-page-model";
import { getItemIdFromTableTestId } from "../../helpers";

export class ClassListPageModel extends ListPageModel {
  protected constructor(page: Page) {
    super(page, "class");
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
    await page.waitForSelector(classList);

    return new ClassListPageModel(page);
  }
}
