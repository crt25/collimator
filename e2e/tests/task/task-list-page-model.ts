/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import { taskList } from "../../selectors";
import { ListPageModel } from "../../page-models/list-page-model";
import { getItemIdFromTableTestId } from "../../helpers";

export class TaskListPageModel extends ListPageModel {
  protected constructor(page: Page) {
    super(page, "task");
  }

  getTitleElementByTitle(title: string) {
    return this.page
      .locator(`[data-testid^='${this.itemPrefix}'][data-testid$='-title']`)
      .getByText(title);
  }

  async getIdByName(title: string) {
    const elLocator = this.getTitleElementByTitle(title);

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
    await page.waitForSelector(taskList);

    return new TaskListPageModel(page);
  }
}
