import { forwardRef } from "react";
import { MessageDescriptor, useIntl } from "react-intl";
import {
  Field,
  Input as ChakraInput,
  InputProps as ChakraInputProps,
  chakra,
} from "@chakra-ui/react";

const InputWrapper = chakra("div", {
  base: {
    display: "block",
  },
});

const StyledInput = chakra(ChakraInput, {
  base: {
    width: "100%",
    maxWidth: "100%",
    padding: "sm",
  },
});

interface Props {
  label?: MessageDescriptor;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
}

// Omit the native size, children attribute to avoid confusion with Chakra UI's size prop
type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "children"
> &
  Props & {
    size?: ChakraInputProps["size"];
  };

const Input = forwardRef(function Input(
  props: InputProps,
  ref: React.Ref<HTMLInputElement>,
) {
  const intl = useIntl();
  const { label, helperText, errorText, invalid, ...inputProps } = props;

  return (
    <InputWrapper>
      <Field.Root invalid={invalid}>
        {label && <Field.Label>{intl.formatMessage(label)}</Field.Label>}
        <StyledInput ref={ref} {...inputProps} />
        {errorText && <Field.ErrorText>{errorText}</Field.ErrorText>}
        {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
      </Field.Root>
    </InputWrapper>
  );
});

export default Input;
