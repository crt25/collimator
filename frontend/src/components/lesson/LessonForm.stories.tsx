import { fn } from "@storybook/test";
import LessonForm from "./LessonForm";

type Args = Parameters<typeof LessonForm>[0];

export default {
  component: LessonForm,
  title: "LessonForm",
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
      name: "The name",
    },
  } as Args,
};
