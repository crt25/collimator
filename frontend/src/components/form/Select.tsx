import styled from "@emotion/styled";
import { forwardRef } from "react";
import { MessageDescriptor, useIntl } from "react-intl";

const StyledSelect = styled.select`
  padding: 0.5rem 1rem;

  background-color: var(--background-color);
  border: var(--foreground-color) 1px solid;
  border-radius: var(--border-radius);
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
  options: { value: string | number; label: string | MessageDescriptor }[];
  children: React.ReactNode;
}

const Select = forwardRef(function Select(
  props: React.InputHTMLAttributes<HTMLSelectElement> & Props,
  ref: React.Ref<HTMLSelectElement>,
) {
  const intl = useIntl();
  const { label, options, children, ...inputProps } = props;

  return (
    <InputWrapper>
      <Label>{intl.formatMessage(label)}</Label>
      <StyledSelect {...inputProps} ref={ref}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {typeof option.label === "string"
              ? option.label
              : intl.formatMessage(option.label)}
          </option>
        ))}
      </StyledSelect>
      {children}
    </InputWrapper>
  );
});

export default Select;
