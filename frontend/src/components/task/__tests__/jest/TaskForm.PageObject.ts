import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskType } from "@/api/collimator/generated/models";

export class TaskFormPageObject {
  readonly user: ReturnType<typeof userEvent.setup>;

  constructor() {
    this.user = userEvent.setup();
  }

  get titleInput(): HTMLInputElement {
    return screen.getByTestId("title") as HTMLInputElement;
  }

  get submitButton(): HTMLInputElement {
    return screen.getByTestId("submit") as HTMLInputElement;
  }

  get typeSelect(): HTMLSelectElement {
    return screen.getByTestId("type");
  }

  get editTaskButton(): HTMLButtonElement {
    return screen.getByTestId("edit-task-button");
  }

  /** Root element of the isPublic checkbox.
   *
   * Note: data-testid is on ChakraCheckbox.Root a <label>, not on
   * HiddenInput, because Zag.js keeps the correct controlled state on Root
   * via data-state="checked|unchecked". Use not.toHaveAttribute("data-state",
   * "checked") instead of toBeChecked().
   */
  get isPublic(): HTMLElement {
    return screen.getByTestId("isPublic");
  }

  querySubmitButton(): HTMLInputElement | null {
    return screen.queryByTestId("submit");
  }

  queryEditTaskButton(): HTMLButtonElement | null {
    return screen.queryByTestId("edit-task-button");
  }

  queryIsPublic(): HTMLElement | null {
    return screen.queryByTestId("isPublic");
  }

  get confirmationModal(): HTMLElement {
    return screen.getByTestId("confirmation-modal");
  }

  queryConfirmationModal(): HTMLElement | null {
    return screen.queryByTestId("confirmation-modal");
  }

  get confirmButton(): HTMLButtonElement {
    return screen.getByTestId("confirm-button");
  }

  get cancelButton(): HTMLButtonElement {
    return screen.getByTestId("cancel-button");
  }

  get mockEditTaskModal(): HTMLElement {
    return screen.getByTestId("mock-edit-task-modal");
  }

  queryMockEditTaskModal(): HTMLElement | null {
    return screen.queryByTestId("mock-edit-task-modal");
  }

  get mockSaveTaskButton(): HTMLButtonElement {
    return screen.getByTestId("mock-save-task-button");
  }

  get mockCloseModal(): HTMLButtonElement {
    return screen.getByTestId("mock-close-modal");
  }

  async typeTitle(text: string): Promise<void> {
    await this.user.type(this.titleInput, text);
  }

  async clearAndTypeTitle(text: string): Promise<void> {
    await this.user.clear(this.titleInput);
    await this.user.type(this.titleInput, text);
  }

  async clickSubmit(): Promise<void> {
    await this.user.click(this.submitButton);
  }

  async selectType(type: TaskType): Promise<void> {
    await this.user.click(this.typeSelect);
    await this.user.click(screen.getByTestId(`select-option-${type}`));
  }

  async clickEditTaskButton(): Promise<void> {
    await this.user.click(this.editTaskButton);
  }

  async clickIsPublic(): Promise<void> {
    await this.user.click(this.isPublic);
  }

  async confirmModal(): Promise<void> {
    await this.user.click(this.confirmButton);
  }

  async cancelModal(): Promise<void> {
    await this.user.click(this.cancelButton);
  }

  async saveTaskInModal(): Promise<void> {
    await this.user.click(this.mockSaveTaskButton);
  }

  async closeTaskModal(): Promise<void> {
    await this.user.click(this.mockCloseModal);
  }
}
