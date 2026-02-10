import { Locator, Page } from "@playwright/test";

export class TaskEditModalPageModel {
  private static readonly taskModal = '[data-testid="task-modal"]';

  protected constructor(private readonly page: Page) {}

  get modal(): Locator {
    return this.page.locator(TaskEditModalPageModel.taskModal);
  }

  get importButton(): Locator {
    return this.modal.getByTestId("import-button");
  }

  get saveButton(): Locator {
    return this.modal.getByTestId("save-button");
  }

  get cancelButton(): Locator {
    return this.modal.getByTestId("cancel-button");
  }

  get modalConfirmButton(): Locator {
    return this.page.getByTestId("confirm-button");
  }


  async import(): Promise<void> {
    await this.importButton.click();
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.waitForModal();
    await this.cancelButton.click();
  }

  async waitForModal(): Promise<void> {
    await this.page.waitForSelector(TaskEditModalPageModel.taskModal);
  }

  static async create(page: Page): Promise<TaskEditModalPageModel> {
    await page.waitForSelector(TaskEditModalPageModel.taskModal);
    return new TaskEditModalPageModel(page);
  }
}
