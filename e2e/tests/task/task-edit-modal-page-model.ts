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
    // then closes the modal (setIsShown(false) after onSave resolves).
    await this.modal.waitFor({ state: "detached", timeout: 60_000 });
  }

  async cancel(): Promise<void> {
    await this.waitForModal();
    await this.cancelButton.click();

    // Cancelling does not always close the modal immediately: before the embedded
    // editor loads, warnBeforeClose closes it directly, once loaded, it asks the
    // user to confirm quitting without saving.
    const confirmation = this.page.getByTestId("confirmation-modal");

    await Promise.race([
      confirmation.waitFor({ state: "visible", timeout: 30_000 }),
      this.modal.waitFor({ state: "detached", timeout: 30_000 }),
    ]);

    if (await confirmation.isVisible()) {
      await this.modalConfirmButton.click();
    }

    await this.modal.waitFor({ state: "detached", timeout: 30_000 });
  }

  async waitForModal(): Promise<void> {
    await this.page.waitForSelector(TaskEditModalPageModel.taskModal);
  }

  static async create(page: Page): Promise<TaskEditModalPageModel> {
    await page.waitForSelector(TaskEditModalPageModel.taskModal);
    return new TaskEditModalPageModel(page);
  }
}
