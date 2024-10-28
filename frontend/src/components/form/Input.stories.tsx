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
    children: <p>Some content below the input such as errors</p>,
    placeholder: "Some placeholder text",
  },
};
