/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import { sessionList } from "../../selectors";
import { ListPageModel } from "../../page-models/list-page-model";
import { getItemIdFromTableTestId } from "../../helpers";

export class SessionListPageModel extends ListPageModel {
  protected constructor(page: Page) {
    super(page, "session");
  }

  getNameElementByTitle(title: string) {
    return this.page
      .locator(`[data-testid^='${this.itemPrefix}'][data-testid$='-title']`)
      .getByText(title);
  }

  async getIdByTitle(title: string) {
    const elLocator = this.getNameElementByTitle(title);

    return getItemIdFromTableTestId(
      await elLocator.evaluate((el) =>
        el.closest("[data-testid$=-title]")!.getAttribute("data-testid"),
      ),
    );
  }

  getTitle(itemId: number | string) {
    return this.page.getByTestId(`${this.itemPrefix}-${itemId}-title`);
  }

  static async create(page: Page) {
    await page.waitForSelector(sessionList);

    return new SessionListPageModel(page);
  }
}
