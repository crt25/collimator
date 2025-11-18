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
  label: MessageDescriptor;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  Props & {
    size?: ChakraTextareaProps["size"];
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
        <ChakraTextarea ref={ref} {...textareaProps} />
        {errorText && <Field.ErrorText>{errorText}</Field.ErrorText>}
        {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
      </Field.Root>
    </InputWrapper>
  );
});

export default TextArea;
