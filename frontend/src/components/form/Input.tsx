import styled from "@emotion/styled";
import { forwardRef } from "react";
import { MessageDescriptor, useIntl } from "react-intl";

const StyledInput = styled.input`
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
  children?: React.ReactNode;
}

const Input = forwardRef(function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & Props,
  ref: React.Ref<HTMLInputElement>,
) {
  const intl = useIntl();
  const { label, children, ...inputProps } = props;

  return (
    <InputWrapper>
      <Label>{intl.formatMessage(label)}</Label>
      <StyledInput {...inputProps} ref={ref} />
      {children}
    </InputWrapper>
  );
});

export default Input;
