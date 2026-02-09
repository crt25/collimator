import { MessageDescriptor, useIntl } from "react-intl";
import { chakra, Checkbox as ChakraCheckbox, Field } from "@chakra-ui/react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { EditedBadge } from "../EditedBadge";

const InputWrapper = chakra("div", {
  base: {
    display: "block",
    marginBottom: "1rem",
  },
});

type ReactHookFormControl<
  TValues extends FieldValues,
  TField extends Path<TValues>,
> = {
  name: TField;
  control: Control<TValues>;
};

type ChakraProps = Omit<
  React.ComponentProps<typeof ChakraCheckbox.Root>,
  "collection" | "value" | "onCheckedChange"
>;

type InternalProps = {
  checked?: boolean;
  label?: MessageDescriptor;
  placeholder?: MessageDescriptor;
  variant?: ChakraProps["variant"];
  children?: React.ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  isDirty?: boolean;
  showEditedBadge?: boolean;
  disabled?: boolean;
};

type SharedProps = InternalProps;

type Props<TValues extends FieldValues, TField extends Path<TValues>> = (
  | ReactHookFormControl<TValues, TField>
  | ChakraProps
) &
  SharedProps;

const InternalCheckbox = (
  props: InternalProps & {
    name?: string;
    checked?: boolean;
  },
) => {
  const intl = useIntl();
  const {
    name,
    checked,
    label,
    onCheckedChange,
    variant,
    isDirty,
    showEditedBadge,
    disabled = false,
  } = props;

  return (
    <ChakraCheckbox.Root
      name={name}
      checked={checked}
      variant={variant}
      onCheckedChange={({ checked }) => onCheckedChange?.(!!checked)}
      disabled={disabled}
    >
      <ChakraCheckbox.HiddenInput />
      <ChakraCheckbox.Control />
      {label && (
        <ChakraCheckbox.Label>
          {intl.formatMessage(label)}
          {showEditedBadge && isDirty && <EditedBadge />}
        </ChakraCheckbox.Label>
      )}
    </ChakraCheckbox.Root>
  );
};

const Checkbox = <TValues extends FieldValues, TField extends Path<TValues>>(
  props: Props<TValues, TField>,
) => {
  const { children, variant, label, placeholder, ...rest } = props;

  if ("control" in props) {
    return (
      <InputWrapper>
        <Controller
          control={props.control}
          name={props.name}
          render={({ field, fieldState }) => (
            <Field.Root>
              <InternalCheckbox
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                isDirty={fieldState.isDirty}
                variant={variant}
                label={label}
                placeholder={placeholder}
                showEditedBadge={props.showEditedBadge}
                disabled={props.disabled}
              >
                {children}
              </InternalCheckbox>
              <Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
            </Field.Root>
          )}
        />
      </InputWrapper>
    );
  }

  return (
    <InputWrapper>
      <InternalCheckbox
        variant={variant}
        label={label}
        placeholder={placeholder}
        {...rest}
      >
        {children}
      </InternalCheckbox>
    </InputWrapper>
  );
};

export default Checkbox;
