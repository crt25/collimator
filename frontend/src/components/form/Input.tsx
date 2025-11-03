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

const ErrorMessage = styled.div`
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

interface Props {
  label?: MessageDescriptor;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
  size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  placeholder?: string;
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> &
  Props;

const Input = forwardRef(function Input(
  props: InputProps,
  ref: React.Ref<HTMLInputElement>,
) {
  const intl = useIntl();
  const {
    label,
    helperText,
    errorText,
    invalid,
    size,
    placeholder,
    ...inputProps
  } = props;

  return (
    <InputWrapper>
      <Field.Root invalid={invalid}>
        {label && <Field.Label>{intl.formatMessage(label)}</Field.Label>}
        <ChakraInput
          css={styledInputStyles}
          size={size}
          ref={ref}
          placeholder={placeholder}
          {...inputProps}
        />
        {errorText && <ErrorMessage>{errorText}</ErrorMessage>}
        {helperText && !invalid && (
          <Field.HelperText>{helperText}</Field.HelperText>
        )}
      </Field.Root>
    </InputWrapper>
  );
});

export default Input;
