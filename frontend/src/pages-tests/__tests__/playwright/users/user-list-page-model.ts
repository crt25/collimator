/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import { userList } from "../selectors";
import { ListPageModel } from "../page-models/list-page-model";

export class UserListPageModel extends ListPageModel {
  protected constructor(page: Page) {
    super(page, "user");
  }

  static async create(page: Page) {
    await page.waitForSelector(userList);

    return new UserListPageModel(page);
  }
}
