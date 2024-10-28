import Input from "./Input";
import ValidationErrorMessage from "./ValidationErrorMessage";

type Args = Parameters<typeof ValidationErrorMessage>[0];

export default {
  component: ValidationErrorMessage,
  title: "ValidationErrorMessage",
  render: (args: Args) => (
    <Input
      label={{
        id: "_",
        defaultMessage: "The label",
      }}
    >
      <ValidationErrorMessage {...args} />
    </Input>
  ),
};

export const Default = {
  args: {
    children: "You should fill in this field correctly",
  } as Args,
};
