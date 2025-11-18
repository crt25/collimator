import { forwardRef } from "react";
import { MessageDescriptor, useIntl } from "react-intl";
import {
  Field,
  Textarea as ChakraTextarea,
  TextareaProps as ChakraTextareaProps,
} from "@chakra-ui/react";
import styled from "@emotion/styled";

const InputWrapper = styled.div`
  display: block;
  margin-bottom: 1rem;
`;

interface Props {
  label?: MessageDescriptor;
  labelBadge?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
}

type TextAreaProps = ChakraTextareaProps & Props;

const TextArea = forwardRef(function TextArea(
  props: TextAreaProps,
  ref: React.Ref<HTMLTextAreaElement>,
) {
  const intl = useIntl();
  const {
    label,
    labelBadge,
    helperText,
    errorText,
    invalid,
    variant,
    ...textareaProps
  } = props;

  return (
    <InputWrapper>
      <Field.Root invalid={invalid || !!errorText}>
        {label && (
          <Field.Label>
            {intl.formatMessage(label)}
            {labelBadge || null}
          </Field.Label>
        )}
        <ChakraTextarea
          ref={ref}
          variant={variant ?? "subtle"}
          {...textareaProps}
        />
        {errorText && <Field.ErrorText>{errorText}</Field.ErrorText>}
        {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
      </Field.Root>
    </InputWrapper>
  );
});

export default TextArea;
