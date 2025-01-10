/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";

const chartSelector = "[data-testid='analysis-chart']";

type AxesCriterionType = "statement" | "test";

export class SessionAnalysisPageModel {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  get chart() {
    return this.page.locator(chartSelector);
  }

  setXAxis(axis: AxesCriterionType) {
    return this.page.getByTestId("analysis-x-axis").selectOption(axis);
  }

  setYAxis(axis: AxesCriterionType) {
    return this.page.getByTestId("analysis-y-axis").selectOption(axis);
  }

  static async create(page: Page) {
    await page.waitForSelector(chartSelector);

    return new SessionAnalysisPageModel(page);
  }
}
