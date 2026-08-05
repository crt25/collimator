import "@testing-library/jest-dom";
import { waitFor } from "@testing-library/react";
import { UserType } from "@/api/collimator/generated/models";
import UserForm from "@/components/user/UserForm";
import { renderWithProviders } from "@/__tests__/helpers/render-with-providers";
import { UserFormPageObject } from "./UserForm.PageObject";

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
        onSubmit={jest.fn()}
      />,
    );

    const form = new UserFormPageObject();
    expect(form.queryEditedBadge()).toBeNull();

    await form.clearAndTypeName("Updated Name");

    await waitFor(() => expect(form.queryEditedBadge()).not.toBeNull());
  });

  it("clears the edited badge after a successful save (CRT-461)", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    renderWithProviders(
      <UserForm
        submitMessage={submitMessage}
        initialValues={initialValues}
        onSubmit={onSubmit}
      />,
    );

    const form = new UserFormPageObject();

    await form.clearAndTypeName("Updated Name");
    await waitFor(() => expect(form.queryEditedBadge()).not.toBeNull());
    await waitFor(() => expect(form.submitButton.disabled).toBe(false));

    await form.clickSubmit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());

    // after saving, the form is re-baselined: the field is no longer edited
    await waitFor(() => expect(form.queryEditedBadge()).toBeNull());
    await waitFor(() => expect(form.submitButton.disabled).toBe(true));
  });
});
