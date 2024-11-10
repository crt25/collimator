import styled from "@emotion/styled";
import { MessageDescriptor, useIntl } from "react-intl";

const StyledInput = styled.input`
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);

  border: none;

  background-color: var(--button-background-color);
  color: var(--button-foreground-color);
`;

const InputWrapper = styled.label`
  display: block;
  margin-bottom: 1rem;
`;

interface Props {
  label: MessageDescriptor;
  children?: React.ReactNode;
}

const SubmitFormButton = (
  props: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "type"> &
    Props,
) => {
  const intl = useIntl();
  const { label, children, ...inputProps } = props;

  return (
    <InputWrapper>
      <StyledInput
        data-testid="submit"
        {...inputProps}
        type="submit"
        value={intl.formatMessage(label)}
      />
      {children}
    </InputWrapper>
  );
};

export default SubmitFormButton;
