import styled from "@emotion/styled";
import { MessageDescriptor, useIntl } from "react-intl";

const StyledInput = styled.input<{ disabled?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);

  border: none;

  background-color: ${({ disabled }) =>
    disabled
      ? "var(--button-disabled-background-color)"
      : "var(--button-background-color)"};

  color: var(--button-foreground-color);
`;

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
    "value" | "type" | "disabled"
  > &
    Props,
) => {
  const intl = useIntl();
  const { label, children, disabled, ...inputProps } = props;

  return (
    <InputWrapper>
      <StyledInput
        data-testid="submit"
        {...inputProps}
        type="submit"
        value={intl.formatMessage(label)}
        disabled={disabled}
      />
      {children}
    </InputWrapper>
  );
};

export default SubmitFormButton;
