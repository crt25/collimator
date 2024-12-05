import styled from "@emotion/styled";
import { forwardRef } from "react";
import { MessageDescriptor, useIntl } from "react-intl";

const StyledSelect = styled.select`
  padding: 0.5rem 1rem;
  max-width: 100%;

  background-color: var(--background-color);
  border: var(--foreground-color) 1px solid;
  border-radius: var(--border-radius);
`;

const InputWrapper = styled.label<{ isShown?: boolean; noMargin?: boolean }>`
  display: block;
  margin-bottom: ${({ noMargin }) => (noMargin ? "0" : "1rem")};

  ${({ isShown }) => !isShown && "display: none;"}
`;

const Label = styled.span`
  display: block;
  margin-bottom: 0.25rem;
`;

interface Props {
  label?: MessageDescriptor;
  options: { value: string | number; label: string | MessageDescriptor }[];
  alwaysShow?: boolean;
  children?: React.ReactNode;
  noMargin?: boolean;
}

const Select = forwardRef(function Select(
  props: React.InputHTMLAttributes<HTMLSelectElement> & Props,
  ref: React.Ref<HTMLSelectElement>,
) {
  const intl = useIntl();
  const { label, options, children, alwaysShow, noMargin, ...inputProps } =
    props;

  return (
    <InputWrapper
      isShown={options.length > 1 || alwaysShow}
      noMargin={noMargin}
    >
      {label && <Label>{intl.formatMessage(label)}</Label>}
      <div>
        <StyledSelect {...inputProps} ref={ref}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {typeof option.label === "string"
                ? option.label
                : intl.formatMessage(option.label)}
            </option>
          ))}
        </StyledSelect>
      </div>
      {children}
    </InputWrapper>
  );
});

export default Select;
