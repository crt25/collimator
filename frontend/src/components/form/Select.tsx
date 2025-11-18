import styled from "@emotion/styled";
import { useMemo } from "react";
import {
  Select as ChakraSelect,
  createListCollection,
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
};

type SharedSelectProps = InternalSelectProps & {
  options: { value: string; label: string | MessageDescriptor }[];
  noMargin?: boolean;
  alwaysShow?: boolean;
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
    isDirty,
  } = props;

  return (
    <>
      <ChakraSelect.Root
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
            {isDirty && <EditedBadge />}
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

        <Portal>
          <ChakraSelect.Positioner>
            <ChakraSelect.Content>
              {collection.items.map((option) => (
                <ChakraSelect.Item key={option.value} item={option}>
                  {option.label}
                </ChakraSelect.Item>
              ))}
            </ChakraSelect.Content>
          </ChakraSelect.Positioner>
        </Portal>
      </ChakraSelect.Root>
    </>
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
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
              isDirty={fieldState.isDirty}
              onInteractOutside={() => field.onBlur()}
              collection={collection}
              variant={variant}
              label={label}
              placeholder={placeholder}
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
        collection={collection}
        variant={variant}
        label={label}
        placeholder={placeholder}
        {...rest}
      >
        {children}
      </InternalSelect>
    </InputWrapper>
  );
};

export default Select;
