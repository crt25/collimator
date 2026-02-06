import { Locator, Page } from "@playwright/test";
import { FormPageModel } from "../../page-models/form-page-model";
import { TaskEditModalPageModel } from "./task-edit-modal-page-model";

export class TaskFormPageModel extends FormPageModel {
  private static readonly taskForm = '[data-testid="task-form"]';
  protected taskEditModalInstance?: TaskEditModalPageModel;

  protected constructor(page: Page) {
    super(page);
  }

  get form(): Locator {
    return this.page.locator(TaskFormPageModel.taskForm);
  }

  get inputs(): {
    title: Locator;
    description: Locator;
    type: Locator;
  } {
    return {
      title: this.form.locator('[data-testid="title"]'),
      description: this.form.locator('[data-testid="description"]'),
      type: this.form.locator('[data-testid="type"]'),
    };
  }

  get submitButton(): Locator {
    return this.form.locator('[data-testid="submit"]');
  }

  get taskEditModal(): TaskEditModalPageModel {
    if (!this.taskEditModalInstance) {
      throw new Error("Task edit modal not opened yet");
    }
    return this.taskEditModalInstance;
  }

  async openEditTaskModal(): Promise<void> {
    await this.form.getByTestId("edit-task-button").click();
    this.taskEditModalInstance = await TaskEditModalPageModel.create(this.page);
  }

  async acceptConfirmationModal(): Promise<void> {
    await this.page.getByTestId("confirm-button").click();
  }

  async importTask(): Promise<void> {
    await this.taskEditModal.import();
  }

  async goToReferenceSolutions(): Promise<void> {
    await this.taskEditModal.goToReferenceSolutions();
  }

  async saveTask(): Promise<void> {
    await this.taskEditModal.save();
  }

  async setTaskType(type: string): Promise<void> {
    await this.selectChakraOption(this.inputs.type, type);
  }

  static async create(page: Page): Promise<TaskFormPageModel> {
    await page.waitForSelector(TaskFormPageModel.taskForm);
    return new TaskFormPageModel(page);
  }
}
