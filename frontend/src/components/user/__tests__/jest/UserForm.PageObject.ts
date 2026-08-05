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

  get emailInput(): HTMLInputElement {
    return screen.getByTestId("email") as HTMLInputElement;
  }

  get typeSelect(): HTMLButtonElement {
    return screen.getByTestId("type") as HTMLButtonElement;
  }

  get submitButton(): HTMLInputElement {
    return screen.getByTestId("submit") as HTMLInputElement;
  }

  queryEditedBadge(): HTMLElement | null {
    return screen.queryAllByText("Edited")[0] ?? null;
  }

  queryEmailValidationError(): HTMLElement | null {
    return screen.queryByText(/must be a valid email/i);
  }

  async clearAndTypeName(value: string): Promise<void> {
    await this.user.clear(this.nameInput);
    await this.user.type(this.nameInput, value);
  }

  async clearAndTypeEmail(value: string): Promise<void> {
    await this.user.clear(this.emailInput);
    await this.user.type(this.emailInput, value);
  }

  async clickSubmit(): Promise<void> {
    await this.user.click(this.submitButton);
  }
}
