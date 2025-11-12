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
  },
});

const StyledInput = chakra(ChakraInput, {
  base: {
    width: "100%",
    maxWidth: "100%",
    padding: "sm",
  },
});

export enum InputType {
  Search = "search",
}

interface Props {
  label?: MessageDescriptor;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
  type?: InputType;
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
  const { label, helperText, errorText, invalid, type, ...inputProps } = props;

  const showSearchIcon = type === InputType.Search;
  
  return (
    <InputWrapper>
      <Field.Root invalid={invalid}>
        {label && <Field.Label>{intl.formatMessage(label)}</Field.Label>}
        <InputGroup startElement={showSearchIcon ? <CiSearch /> : undefined}>
          <StyledInput ref={ref} {...inputProps} />
        </InputGroup>
        {errorText && <Field.ErrorText>{errorText}</Field.ErrorText>}
        {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
      </Field.Root>
    </InputWrapper>
  );
});

export default Input;
