import { fn } from "@storybook/test";
import ClassForm from "./ClassForm";

type Args = Parameters<typeof ClassForm>[0];

export default {
  component: ClassForm,
  title: "ClassForm",
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
      name: "Class 1",
    },
  } as Args,
};
