import Select from "./Select";

export default {
  component: Select,
  title: "Select",
};

type Args = Parameters<typeof Select>[0];

export const Default = {
  args: {
    label: {
      id: "_",
      defaultMessage: "The label",
    },
    options: [
      { label: "Option 1", value: "1" },
      {
        label: {
          id: "_",
          defaultMessage: "Option 2",
        },
        value: "2",
      },
    ],
    children: <p>Some content below the select such as errors</p>,
  } as Args,
};
