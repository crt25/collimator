/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "playwright/test";
import { loadTask } from "../helpers";
import tasks, { TestTask } from "../tasks";
import { ScratchEditorPage } from "./scratch-editor";

export class TestFailingTaskPage extends ScratchEditorPage {
  private constructor(page: Page) {
    super(page);
  }

  get errorMessage() {
    return this.page.locator(".task-error-message");
  }

  get retryButton() {
    return this.page.getByRole("button", { name: "Retry" });
  }

  async expectErrorVisible(message: string) {
    await this.errorMessage
      .filter({ hasText: message })
      .waitFor({ state: "visible" });
  }

  async retry() {
    await this.retryButton.click();
  }

  static async load(
    pwPage: Page,
    task?: TestTask,
  ): Promise<{ page: TestFailingTaskPage; task: TestTask }> {
    const chosenTask = task ?? tasks.testFailingTask;

    await loadTask(pwPage, chosenTask, true);

    const page = new TestFailingTaskPage(pwPage);
    await page.resetZoom();

    return { page, task: chosenTask };
  }
}
