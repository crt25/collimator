import Input from "./Input";

export default {
  component: Input,
  title: "Input",
};

export const Default = {
  args: {
    label: {
      id: "_",
      defaultMessage: "The label",
    },
    invalid: true,
    errorText: "This is an error message",
    placeholder: "Some placeholder text",
  },
};
