import styled from "@emotion/styled";
import { forwardRef } from "react";
import { MessageDescriptor, useIntl } from "react-intl";

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 10rem;

  padding: 0.25rem 0.5rem;
`;

const InputWrapper = styled.label`
  display: block;
  margin-bottom: 1rem;
`;

const Label = styled.span`
  display: block;
  margin-bottom: 0.25rem;
`;

interface Props {
  label: MessageDescriptor;
  children: React.ReactNode;
}

const TextArea = forwardRef(function Input(
  props: React.InputHTMLAttributes<HTMLTextAreaElement> & Props,
  ref: React.Ref<HTMLTextAreaElement>,
) {
  const intl = useIntl();
  const { label, children, ...inputProps } = props;

  return (
    <InputWrapper>
      <Label>{intl.formatMessage(label)}</Label>
      <StyledTextarea {...inputProps} ref={ref} />
      {children}
    </InputWrapper>
  );
});

export default TextArea;
