/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import { classList } from "../selectors";
import { ListPageModel } from "../page-models/list-page-model";

export class ClassListPageModel extends ListPageModel {
  protected constructor(page: Page) {
    super(page, "class");
  }

  static async create(page: Page) {
    await page.waitForSelector(classList);

    return new ClassListPageModel(page);
  }
}
