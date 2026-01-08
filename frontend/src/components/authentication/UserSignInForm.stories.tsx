import { fn } from "storybook/test";
import { UseFormSetError } from "react-hook-form";
import UserSignInForm, { UserSignInFormValues } from "./UserSignInForm";

type Args = Parameters<typeof UserSignInForm>[0];

export default {
  component: UserSignInForm,
  title: "UserSignInForm",
};

export const Default = {
  args: {
    submitMessage: {
      id: "_",
      defaultMessage: "Submit",
    },
    onSubmit: fn(),
  } as Args,
};

export const WithCustomSubmitButton = {
  args: {
    submitMessage: {
      id: "_",
      defaultMessage: "Press me",
    },
    onSubmit: fn(),
  } as Args,
};

export const WithInitialValues = {
  args: {
    submitMessage: {
      id: "_",
      defaultMessage: "Press me",
    },
    onSubmit: fn(),
    initialValues: {
      password: "hunter2",
    },
  } as Args,
};

export const WithBackupPassword = {
  args: {
    submitMessage: {
      id: "_",
      defaultMessage: "Create new key",
    },
    onSubmit: fn(),
    showBackupPassword: true,
  } as Args,
};

export const WithCustomError = {
  args: {
    submitMessage: {
      id: "_",
      defaultMessage: "Press me",
    },
    onSubmit: fn((data, setError: UseFormSetError<UserSignInFormValues>) => {
      setError(
        "password",
        { type: "custom", message: "a custom error message" },
        {
          shouldFocus: true,
        },
      );
    }),
  } as Args,
};
