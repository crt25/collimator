import "@testing-library/jest-dom";
import { waitFor } from "@testing-library/react";
import { UserFormPageObject } from "./UserForm.PageObject";
import { UserType } from "@/api/collimator/generated/models";
import UserForm from "@/components/user/UserForm";
import { renderWithProviders } from "@/__tests__/helpers/render-with-providers";

const submitMessage = { id: "submit", defaultMessage: "Save" };

const initialValues = {
  name: "Existing Name",
  email: "existing@example.com",
  type: UserType.TEACHER,
};

describe("UserForm UI Interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the edited badge for a modified field", async () => {
    renderWithProviders(
      <UserForm
        submitMessage={submitMessage}
        initialValues={initialValues}
        onSubmit={jest.fn().mockResolvedValue(true)}
      />,
    );

    const form = new UserFormPageObject();

    expect(form.typeInput).toHaveValue(UserType.TEACHER);
    expect(form.queryEditedBadge()).toBeNull();

    await form.clearAndTypeName("Updated Name");

    await waitFor(() => expect(form.queryEditedBadge()).not.toBeNull());
  });

  it("clears the edited badge after a successful save (CRT-461)", async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    renderWithProviders(
      <UserForm
        submitMessage={submitMessage}
        initialValues={initialValues}
        onSubmit={onSubmit}
      />,
    );

    const form = new UserFormPageObject();

    await form.clearAndTypeEmail("invalid-email");
    await form.clickSubmit();
    await waitFor(() =>
      expect(form.queryEmailValidationError()).not.toBeNull(),
    );
    expect(onSubmit).not.toHaveBeenCalled();

    await form.clearAndTypeEmail("updated@example.com");
    await form.clearAndTypeName("Updated Name");
    await waitFor(() => expect(form.queryEditedBadge()).not.toBeNull());
    await waitFor(() => expect(form.submitButton.disabled).toBe(false));

    await form.clickSubmit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());

    // after saving, the form is re-baselined: the field is no longer edited
    await waitFor(() => expect(form.queryEditedBadge()).toBeNull());
    expect(form.queryEmailValidationError()).toBeNull();
    await waitFor(() => expect(form.submitButton.disabled).toBe(true));
  });

  it("preserves unsaved state after a failed save", async () => {
    const onSubmit = jest.fn().mockResolvedValue(false);
    renderWithProviders(
      <UserForm
        submitMessage={submitMessage}
        initialValues={initialValues}
        onSubmit={onSubmit}
      />,
    );

    const form = new UserFormPageObject();
    await form.clearAndTypeName("Updated Name");
    await form.clickSubmit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    await waitFor(() => expect(form.submitButton.disabled).toBe(false));
    expect(form.queryEditedBadge()).not.toBeNull();
  });

  it("locks editable controls while saving", async () => {
    let resolveSubmit: (succeeded: boolean) => void = () => undefined;
    const onSubmit = jest.fn().mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolveSubmit = resolve;
      }),
    );
    renderWithProviders(
      <UserForm
        submitMessage={submitMessage}
        initialValues={initialValues}
        onSubmit={onSubmit}
      />,
    );

    const form = new UserFormPageObject();
    await form.clearAndTypeName("Updated Name");
    await form.clickSubmit();

    await waitFor(() => expect(form.nameInput).toBeDisabled());
    expect(form.emailInput).toBeDisabled();
    expect(form.typeSelect).toBeDisabled();

    resolveSubmit(true);
    await waitFor(() => expect(form.queryEditedBadge()).toBeNull());
  });
});
