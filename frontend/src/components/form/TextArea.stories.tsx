import TextArea from "./TextArea";

export default {
  component: TextArea,
  title: "TextArea",
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
