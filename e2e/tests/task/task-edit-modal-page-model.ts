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
    // The save handler runs an async round-trip to the embedded editor and only
    // then closes the modal (setIsShown(false) after onSave resolves). Wait for
    // the modal — and the embedded scratch iframe it contains — to detach before
    // returning. Otherwise the caller's next interaction with the underlying
    // task form (e.g. clicking its submit button) races the still-mounted iframe,
    // which sits over the form and intercepts the pointer events until timeout.
    await this.modal.waitFor({ state: "detached", timeout: 60_000 });
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
