import { fn } from "storybook/test";
import UserForm from "./UserForm";

type Args = Parameters<typeof UserForm>[0];

export default {
  component: UserForm,
  title: "UserForm",
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
      name: "John Doe",
      openIdConnectSub: "john.doe@example.com",
      type: "ADMIN",
    },
  } as Args,
};
