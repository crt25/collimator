import styled from "@emotion/styled";
import { MessageDescriptor, useIntl } from "react-intl";
import Input from "./Input";

const InputWrapper = styled.label`
  display: block;
  margin-bottom: 1rem;
`;

interface Props {
  label: MessageDescriptor;
  children?: React.ReactNode;
  disabled?: boolean;
}

const SubmitFormButton = (
  props: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "type" | "disabled" | "size"
  > &
    Props,
) => {
  const intl = useIntl();
  const { label, children, disabled, ...inputProps } = props;

  return (
    <InputWrapper>
      <Input
        data-testid="submit"
        {...inputProps}
        type="submit"
        value={intl.formatMessage(label)}
        disabled={disabled}
        variant="buttonForm"
      />
      {children}
    </InputWrapper>
  );
};

export default SubmitFormButton;
