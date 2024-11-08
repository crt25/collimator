/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import { taskList } from "../selectors";
import { ListPageModel } from "../page-models/list-page-model";

export class TaskListPageModel extends ListPageModel {
  protected constructor(page: Page) {
    super(page, "task");
  }

  static async create(page: Page) {
    await page.waitForSelector(taskList);

    return new TaskListPageModel(page);
  }
}
