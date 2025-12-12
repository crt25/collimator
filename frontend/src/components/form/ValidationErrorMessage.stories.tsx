import Input from "./Input";
import ValidationErrorMessage from "./ValidationErrorMessage";

export default {
  component: ValidationErrorMessage,
  title: "ValidationErrorMessage",
  render: () => (
    <Input
      label={{
        id: "_",
        defaultMessage: "The label",
      }}
    ></Input>
  ),
};

export const Default = {};
