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
    children: <p>Some content below the input such as errors</p>,
    placeholder: "Some placeholder text",
  },
};
