import { forwardRef } from "react";
import { MessageDescriptor, useIntl } from "react-intl";
import { Field, Input as ChakraInput } from "@chakra-ui/react";
import styled from "@emotion/styled";

const InputWrapper = styled.label`
  display: block;
`;

const styledInputStyles = {
  padding: "0.25rem 0.5rem",
  maxWidth: "100%",
};

interface Props {
  label?: MessageDescriptor;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
}

// Omit the native size attribute to avoid confusion with Chakra UI's size prop
type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> &
  Props & {
    size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
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
        <ChakraInput css={styledInputStyles} ref={ref} {...inputProps} />
        {errorText && <Field.ErrorText>{errorText}</Field.ErrorText>}
        {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
      </Field.Root>
    </InputWrapper>
  );
});

export default Input;
