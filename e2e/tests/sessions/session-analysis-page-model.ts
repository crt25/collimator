/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import { FormPageModel } from "../../page-models/form-page-model";

const chartSelector = "[data-testid='analysis-chart']";

type AxesCriterionType = "statement" | "test";

export class SessionAnalysisPageModel extends FormPageModel {
  protected constructor(page: Page) {
    super(page);
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

  async navigateToTaskAnalysisPage(taskId: string) {
    await this.page.getByTestId(`task-${taskId}`).click();
  }

  async navigateToTaskInstanceTabPage() {
    await this.page.getByTestId("task-instance-analysis-tab").click();
  }
}
