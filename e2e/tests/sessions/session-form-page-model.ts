/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import { FormPageModel } from "../../page-models/form-page-model";

enum SharingType {
  anonymous = "anonymous",
  private = "private",
}

export class SessionFormPageModel extends FormPageModel {
  private static readonly classForm = '[data-testid="session-form"]';

  protected constructor(page: Page) {
    super(page);
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
      sharingType: this.form.locator('[data-testid="sharing-type"]'),
    };
  }

  get submitButton() {
    return this.form.locator('[data-testid="submit"]');
  }

  getAvailableTaskIds() {
    // we rely on data-state="open" to select only the active select options, as ChakraUI does not allow two selects to be open at the same time
    return this.page
      .locator('[data-testid="id"][data-state="open"][data-part="item"]')
      .evaluateAll((elements) =>
        elements
          .map((el) => parseInt(el.getAttribute("data-value") ?? ""))
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

  async setSessionSharingType(isAnonymous: boolean) {
    await this.selectChakraOption(
      this.inputs.sharingType,
      isAnonymous ? SharingType.anonymous : SharingType.private,
    );
  }

  async setTask(taskId: string) {
    await this.selectChakraOption(this.inputs.addTaskSelect, taskId);
  }

  static async create(page: Page) {
    await page.waitForSelector(SessionFormPageModel.classForm);

    return new SessionFormPageModel(page);
  }
}
