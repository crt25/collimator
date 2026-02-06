import { Locator, Page } from "@playwright/test";
import { getItemIdFromTableTestId } from "../../helpers";
import { TaskFormPageModel } from "./task-form-page-model";
import { TaskEditModalPageModel } from "./task-edit-modal-page-model";

const NOT_FOUND = -1;

export class TaskFormReferenceSolutionsPageModel extends TaskFormPageModel {
  private static readonly referenceSolutionsForm =
    '[data-testid="task-reference-solutions-form"]';

  protected constructor(page: Page) {
    super(page);
  }

  override get form(): Locator {
    return this.page.locator(
      TaskFormReferenceSolutionsPageModel.referenceSolutionsForm,
    );
  }

  override get submitButton(): Locator {
    return this.form.getByTestId("task-reference-solutions-form-submit");
  }

  getSubmitFormButton(): Locator {
    return this.form.getByTestId("submit-button");
  }

  get referenceSolutionsList(): Locator {
    return this.form.getByTestId("reference-solutions");
  }

  get addReferenceSolutionButton(): Locator {
    return this.form.getByRole("button", { name: /add reference solution/i });
  }

  getEditSolutionButton(solutionId: number): Locator {
    return this.form.getByTestId(`edit-solution-button-${solutionId}`);
  }

  getTitleInput(solutionId: number): Locator {
    return this.form.getByTestId(
      `reference-solution-${solutionId}-title-input`,
    );
  }

  getDescriptionTextarea(solutionId: number): Locator {
    return this.form.getByTestId(
      `reference-solution-${solutionId}-description-input`,
    );
  }

  getTaskEditModal(): Locator {
    return this.taskEditModal.modal;
  }

  async getAllSolutionsIds(): Promise<number[]> {
    const solutionItems = this.referenceSolutionsList.locator(
      '[data-testid^="solution-"]',
    );
    const solutionIds: number[] = [];
    const count = await solutionItems.count();

    for (let i = 0; i < count; i++) {
      const testId = await solutionItems.nth(i).getAttribute("data-testid");

      if (testId) {
        const id = getItemIdFromTableTestId(testId);
        solutionIds.push(id);
      }
    }
    return solutionIds;
  }

  async lastSolutionId(): Promise<number> {
    const allSolutionIds = await this.getAllSolutionsIds();
    if (allSolutionIds.length === 0) {
      return NOT_FOUND;
    }

    return allSolutionIds[allSolutionIds.length - 1];
  }

  async getReferenceSolutionCount(): Promise<number> {
    const ids = await this.getAllSolutionsIds();
    return ids.length;
  }

  async addReferenceSolution(): Promise<void> {
    await this.addReferenceSolutionButton.click();
  }

  async fillReferenceSolution(
    solutionId: number,
    data: { title: string; description: string },
  ): Promise<void> {
    await this.getTitleInput(solutionId).fill(data.title);
    await this.getDescriptionTextarea(solutionId).fill(data.description);
  }

  async openEditSolutionModal(solutionId: number): Promise<void> {
    await this.getEditSolutionButton(solutionId).click();
    this.taskEditModalInstance = await TaskEditModalPageModel.create(this.page);
  }

  async importSolution(
    name: string,
    mimeType: string,
    file: Buffer,
  ): Promise<void> {
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.taskEditModal.import();
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles({
      name: name,
      mimeType: mimeType,
      buffer: file,
    });
  }

  async saveSolution(): Promise<void> {
    await this.taskEditModal.save();
  }

  async closeSolutionModal(): Promise<void> {
    await this.taskEditModal.cancel();
  }

  async submitForm(): Promise<void> {
    await this.submitButton.click();
  }

  static override async create(
    page: Page,
  ): Promise<TaskFormReferenceSolutionsPageModel> {
    await page.waitForSelector(
      TaskFormReferenceSolutionsPageModel.referenceSolutionsForm,
    );
    return new TaskFormReferenceSolutionsPageModel(page);
  }
}
