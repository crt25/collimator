import { forwardRef } from "react";
import { MessageDescriptor, useIntl } from "react-intl";
import { CiSearch } from "react-icons/ci";
import {
  Field,
  Input as ChakraInput,
  InputProps as ChakraInputProps,
  chakra,
  InputGroup,
} from "@chakra-ui/react";

const InputWrapper = chakra("div", {
  base: {
    display: "block",
    marginBottom: "1rem",
  },
});

export enum InputVariety {
  Search = "search",
}

interface Props {
  label?: MessageDescriptor;
  labelBadge?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
  variety?: InputVariety;
  variant?: ChakraInputProps["variant"];
}

// Omit the native size, children attribute to avoid confusion with Chakra UI's size prop
type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "children"
> &
  Props & {
    size?: ChakraInputProps["size"];
  };

const Input = forwardRef(function Input(
  props: InputProps,
  ref: React.Ref<HTMLInputElement>,
) {
  const intl = useIntl();
  const {
    label,
    helperText,
    errorText,
    invalid,
    variety,
    variant = "subtle",
    type,
    labelBadge,
    ...inputProps
  } = props;

  const showSearchIcon = variety === InputVariety.Search;

  return (
    <InputWrapper>
      <Field.Root invalid={invalid}>
        {label && (
          <Field.Label>
            {intl.formatMessage(label)}
            {labelBadge}
          </Field.Label>
        )}
        <InputGroup startElement={showSearchIcon ? <CiSearch /> : undefined}>
          <ChakraInput
            ref={ref}
            type={type}
            variant={variant}
            {...inputProps}
          />
        </InputGroup>
        {errorText && <Field.ErrorText>{errorText}</Field.ErrorText>}
        {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
      </Field.Root>
    </InputWrapper>
  );
});

export default Input;
