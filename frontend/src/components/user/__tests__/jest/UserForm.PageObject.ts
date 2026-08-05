import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export class UserFormPageObject {
  readonly user: ReturnType<typeof userEvent.setup>;

  constructor() {
    this.user = userEvent.setup();
  }

  get nameInput(): HTMLInputElement {
    return screen.getByTestId("name") as HTMLInputElement;
  }

  get submitButton(): HTMLInputElement {
    return screen.getByTestId("submit") as HTMLInputElement;
  }

  queryEditedBadge(): HTMLElement | null {
    return screen.queryByText("Edited");
  }

  async clearAndTypeName(value: string): Promise<void> {
    await this.user.clear(this.nameInput);
    await this.user.type(this.nameInput, value);
  }

  async clickSubmit(): Promise<void> {
    await this.user.click(this.submitButton);
  }
}
