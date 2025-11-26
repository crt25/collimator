/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import { FormPageModel } from "../../page-models/form-page-model";

export class TaskFormPageModel extends FormPageModel {
  private static readonly taskForm = '[data-testid="task-form"]';
  private static readonly taskModal = '[data-testid="task-modal"]';

  protected constructor(page: Page) {
    super(page);
  }

  get form() {
    return this.page.locator(TaskFormPageModel.taskForm);
  }

  get inputs() {
    return {
      title: this.form.locator('[data-testid="title"]'),
      description: this.form.locator('[data-testid="description"]'),
      type: this.form.locator('[data-testid="type"]'),
    };
  }

  get submitButton() {
    return this.form.locator('[data-testid="submit"]');
  }

  get taskEditModal() {
    return this.page.locator(TaskFormPageModel.taskModal);
  }

  async openEditTaskModal() {
    await this.form.getByTestId("edit-task-button").click();
    await this.page.waitForSelector(TaskFormPageModel.taskModal);
  }

  async importTask() {
    return this.taskEditModal.getByTestId("import-button").click();
  }

  async exportTask() {
    return this.taskEditModal.getByTestId("export-button").click();
  }

  async saveTask() {
    return this.taskEditModal.getByTestId("save-button").click();
  }

  static async create(page: Page) {
    await page.waitForSelector(TaskFormPageModel.taskForm);

    return new TaskFormPageModel(page);
  }
}
