import { fn } from "@storybook/test";
import SubmitFormButton from "./SubmitFormButton";

export default {
  component: SubmitFormButton,
  title: "SubmitFormButton",
};

type Args = Parameters<typeof SubmitFormButton>[0];

export const Default = {
  args: {
    label: {
      id: "_",
      defaultMessage: "The label",
    },
    onClick: fn(),
    children: <p>Some content below the button such as errors</p>,
  } as Args,
};
