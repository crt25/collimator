/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";

export class SessionFormPageModel {
  private static readonly classForm = '[data-testid="session-form"]';

  readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  get form() {
    return this.page.locator(SessionFormPageModel.classForm);
  }

  get inputs() {
    return {
      title: this.form.locator('[data-testid="title"]'),
      description: this.form.locator('[data-testid="description"]'),
      addTaskSelect: this.form.locator('[data-testid="add-task"]'),
      selectedTasks: this.form.locator('[data-testid="selected-tasks"]'),
      isAnonymous: this.form.locator('[data-testid="is-anonymous"]'),
    };
  }

  get submitButton() {
    return this.form.locator('[data-testid="submit"]');
  }

  getAvailableTaskIds() {
    return this.inputs.addTaskSelect.evaluate((el) =>
      [...el.querySelectorAll("option")]
        .map((option) => parseInt(option.value))
        .filter((id) => !isNaN(id) && id > 0),
    );
  }

  getSelectedTaskIds() {
    return this.inputs.selectedTasks.evaluate((el) =>
      [...el.querySelectorAll('[data-testid^="selected-tasks-item-"]')].map(
        (option) => parseInt(option.getAttribute("data-testid")!.split("-")[3]),
      ),
    );
  }

  async moveTaskToTop(taskId: number) {
    await this.page.hover(`[data-testid="selected-tasks-item-${taskId}"]`, {
      position: { x: 10, y: 5 },
    });

    // dragTo does not work so we have to do it manually
    await this.page.mouse.down();

    const wrapperBounds = await this.inputs.selectedTasks.evaluate((el) =>
      el.getBoundingClientRect(),
    );
    await this.page.mouse.move(wrapperBounds.x, wrapperBounds.y, { steps: 5 });
    await this.page.mouse.up();
  }

  async removeTask(taskId: number) {
    return this.page
      .locator(
        `[data-testid="selected-tasks-item-${taskId}"] [data-testid="remove-task"]`,
      )
      .click();
  }

  static async create(page: Page) {
    await page.waitForSelector(SessionFormPageModel.classForm);

    return new SessionFormPageModel(page);
  }
}
