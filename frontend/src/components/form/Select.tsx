import styled from "@emotion/styled";
import { useMemo } from "react";
import {
  Select as ChakraSelect,
  createListCollection,
  Field,
  ListCollection,
  Portal,
} from "@chakra-ui/react";
import { MessageDescriptor, useIntl } from "react-intl";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { EditedBadge } from "../EditedBadge";

const InputWrapper = styled.label<{ isShown?: boolean; noMargin?: boolean }>`
  display: block;
  margin-bottom: ${({ noMargin }) => (noMargin ? "0" : "1rem")};

  ${({ isShown }) => !isShown && "display: none;"}
`;

type ReactHookFormControl<
  TValues extends FieldValues,
  TField extends Path<TValues>,
> = {
  name: TField;
  control: Control<TValues>;
};

type ChakraSelectProps = Omit<
  React.ComponentProps<typeof ChakraSelect.Root>,
  "collection" | "value" | "onValueChange" | "onInteractOutside"
>;

type InternalSelectProps = {
  value?: string;
  label?: MessageDescriptor;
  placeholder?: MessageDescriptor;
  variant?: ChakraSelectProps["variant"];
  children?: React.ReactNode;
  onValueChange?: (value: string) => void;
  onInteractOutside?: () => void;
  isDirty?: boolean;
  showEditedBadge?: boolean;
  errorMessage?: string;
};

type SharedSelectProps = InternalSelectProps & {
  options: { value: string; label: string | MessageDescriptor }[];
  noMargin?: boolean;
  alwaysShow?: boolean;
  // True if the Select is rendered inside a Chakra UI Dialog, false otherwise
  // Chakra's Dialog traps focus within its content, so the Select dropdown
  // cannot be interacted with if it's rendered via a Portal at the document
  // body (outside the Dialog DOM tree).
  // see https://github.com/chakra-ui/ark/discussions/2299
  insideDialog?: boolean;
};

type Props<TValues extends FieldValues, TField extends Path<TValues>> = (
  | ReactHookFormControl<TValues, TField>
  | ChakraSelectProps
) &
  SharedSelectProps;

const InternalSelect = (
  props: InternalSelectProps & {
    name?: string;
    value?: string;
    insideDialog?: boolean;
    collection: ListCollection<{
      label: string;
      value: string;
    }>;
  },
) => {
  const intl = useIntl();

  const {
    name,
    value,
    onValueChange,
    onInteractOutside,
    label,
    placeholder,
    collection,
    variant,
    showEditedBadge,
    isDirty,
    errorMessage,
    children,
    insideDialog,
    ...rest
  } = props;

  return (
    <Field.Root invalid={!!errorMessage}>
      <ChakraSelect.Root
        {...rest}
        name={name}
        value={value !== undefined ? [value.toString()] : []}
        onValueChange={(v) => onValueChange?.(v.value[0])}
        onInteractOutside={onInteractOutside}
        variant={variant ?? "subtle"}
        collection={collection}
      >
        <ChakraSelect.HiddenSelect />
        {label && (
          <ChakraSelect.Label>
            {intl.formatMessage(label)}
            {showEditedBadge && isDirty && <EditedBadge />}
          </ChakraSelect.Label>
        )}

        <ChakraSelect.Control>
          <ChakraSelect.Trigger>
            <ChakraSelect.ValueText
              placeholder={
                placeholder ? intl.formatMessage(placeholder) : undefined
              }
            />
          </ChakraSelect.Trigger>
          <ChakraSelect.IndicatorGroup>
            {placeholder && <ChakraSelect.ClearTrigger />}
            <ChakraSelect.Indicator />
          </ChakraSelect.IndicatorGroup>
        </ChakraSelect.Control>

        {errorMessage && <Field.ErrorText>{errorMessage}</Field.ErrorText>}

        {children}

        {(() => {
          const positioner = (
            <ChakraSelect.Positioner>
              <ChakraSelect.Content>
                {collection.items.map((option) => (
                  <ChakraSelect.Item
                    key={option.value}
                    item={option}
                    data-testid={`select-option-${option.value}`}
                  >
                    {option.label}
                  </ChakraSelect.Item>
                ))}
              </ChakraSelect.Content>
            </ChakraSelect.Positioner>
          );

          return insideDialog ? positioner : <Portal>{positioner}</Portal>;
        })()}
      </ChakraSelect.Root>
    </Field.Root>
  );
};

const Select = <TValues extends FieldValues, TField extends Path<TValues>>(
  props: Props<TValues, TField>,
) => {
  const intl = useIntl();
  const {
    options,
    children,
    variant,
    label,
    placeholder,
    noMargin,
    alwaysShow,
    insideDialog,
    ...rest
  } = props;

  const collection = useMemo(
    () =>
      createListCollection({
        items: options.map((o) => ({
          ...o,
          label:
            typeof o.label === "string" ? o.label : intl.formatMessage(o.label),
        })),
      }),
    [intl, options],
  );

  if ("control" in props) {
    return (
      <InputWrapper
        isShown={options.length > 1 || alwaysShow}
        noMargin={noMargin}
      >
        <Controller
          control={props.control}
          name={props.name}
          render={({ field, fieldState }) => (
            <InternalSelect
              {...rest}
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
              isDirty={fieldState.isDirty}
              errorMessage={fieldState.error?.message}
              onInteractOutside={() => field.onBlur()}
              collection={collection}
              variant={variant}
              label={label}
              placeholder={placeholder}
              insideDialog={insideDialog}
            >
              {children}
            </InternalSelect>
          )}
        />
      </InputWrapper>
    );
  }

  return (
    <InputWrapper
      isShown={options.length > 1 || alwaysShow}
      noMargin={noMargin}
    >
      <InternalSelect
        {...rest}
        collection={collection}
        variant={variant}
        label={label}
        placeholder={placeholder}
        insideDialog={insideDialog}
      >
        {children}
      </InternalSelect>
    </InputWrapper>
  );
};

export default Select;
