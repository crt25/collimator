/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import { progressList } from "../../selectors";

export class SessionProgressPageModel {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  waitForRows(rows: number) {
    return this.page.waitForFunction(
      ({ selector, rows }) =>
        document.querySelectorAll(`${selector} tbody tr`).length === rows,
      { selector: progressList, rows },
    );
  }

  static async create(page: Page) {
    await page.waitForSelector(progressList);

    return new SessionProgressPageModel(page);
  }
}
