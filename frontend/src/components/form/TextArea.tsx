import { forwardRef } from "react";
import { MessageDescriptor, useIntl } from "react-intl";
import { Field, Textarea as ChakraTextarea } from "@chakra-ui/react";
import styled from "@emotion/styled";

const InputWrapper = styled.label`
  display: block;
  margin-bottom: 1rem;
`;

const styledTextareaStyles = {
  padding: "0.25rem 0.5rem",
  minHeight: "10rem",
  width: "100%",
};

interface Props {
  label: MessageDescriptor;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
}

type TextAreaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> &
  Props & {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
  };

const TextArea = forwardRef(function TextArea(
  props: TextAreaProps,
  ref: React.Ref<HTMLTextAreaElement>,
) {
  const intl = useIntl();
  const { label, helperText, errorText, invalid, ...textareaProps } = props;

  return (
    <InputWrapper>
      <Field.Root invalid={invalid}>
        <Field.Label>{intl.formatMessage(label)}</Field.Label>
        <ChakraTextarea
          css={styledTextareaStyles}
          ref={ref}
          {...textareaProps}
        />
        {errorText && <Field.ErrorText>{errorText}</Field.ErrorText>}
        {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
      </Field.Root>
    </InputWrapper>
  );
});

export default TextArea;
