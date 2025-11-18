import { useForm, Controller, UseFormReset } from "react-hook-form";
import * as yup from "yup";
import { defineMessages, MessageDescriptor } from "react-intl";
import {
  Portal,
  Select,
  createListCollection,
  chakra,
  Field,
  Flex,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import Input from "../form/Input";
import FormContainer from "../form/FormContainer";
import { EditedBadge } from "../EditedBadge";
import FormGrid from "../form/FormGrid";
import SubmitFormButton from "../form/SubmitFormButton";

const ButtonWrapper = chakra("div", {
  base: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "4xl",
  },
});

const messages = defineMessages({
  title: {
    id: "SessionForm.title",
    defaultMessage: "Title",
  },
  sharingType: {
    id: "SessionForm.sharingType",
    defaultMessage: "Sharing Type",
  },
  placeholderSelectSharingType: {
    id: "SessionForm.placeholder.selectSharingType",
    defaultMessage: "Select Sharing Type",
  },
  titleRequired: {
    id: "SessionForm.error.titleRequired",
    defaultMessage: "Title is required",
  },
  sharingTypeRequired: {
    id: "SessionForm.error.sharingTypeRequired",
    defaultMessage: "Sharing Type is required",
  },
  sharingTypeAnonymous: {
    id: "SessionForm.sharingType.anonymous",
    defaultMessage: "Anonymous",
  },
  sharingTypePublic: {
    id: "SessionForm.sharingType.public",
    defaultMessage: "Public",
  },
  disabledSaveButtonTooltip: {
    id: "SessionForm.tooltip.disabledSaveButton",
    defaultMessage: "No changes to save",
  },
});

export type SessionFormValues = {
  title: string;
  sharingType: string;
  description: string;
  taskIds: number[];
};

const SessionForm = ({
  submitMessage,
  initialValues,
  onSubmit,
  onFormReady,
}: {
  submitMessage: MessageDescriptor;
  initialValues?: Partial<SessionFormValues>;
  onSubmit: (data: SessionFormValues) => void;
  onFormReady?: (reset: UseFormReset<SessionFormValues>) => void;
}) => {
  const schema = useYupSchema({
    title: yup.string().required(messages.titleRequired.defaultMessage),
    sharingType: yup
      .string()
      .required(messages.sharingTypeRequired.defaultMessage),
    description: yup.string().default(""),
    taskIds: yup.array().of(yup.number().required()).default([]),
  });

  const resolver = useYupResolver(schema);

  const defaultValues = useMemo(
    () => ({
      ...initialValues,
      taskIds: initialValues?.taskIds ?? [],
    }),
    [initialValues],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isDirty },
    control,
    reset,
  } = useForm<SessionFormValues>({
    resolver,
    defaultValues,
  });

  useMemo(() => {
    if (onFormReady) {
      onFormReady(reset);
    }
  }, [onFormReady, reset]);

  // If the initialValues are provided, show the EditedBadge for fields that have been modified
  const showEditedBadges = !!initialValues;

  type SharingTypeOption = {
    value: string;
    label: string;
  };

  const collection = createListCollection<SharingTypeOption>({
    items: [
      {
        value: "anonymous",
        label: messages.sharingTypeAnonymous.defaultMessage,
      },
      {
        value: "public",
        label: messages.sharingTypePublic.defaultMessage,
      },
    ],
  });

  return (
    <FormContainer
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      data-testid="session-form"
    >
      <FormGrid>
        <Input
          label={messages.title}
          {...register("title")}
          data-testid="title"
          variant="inputForm"
          invalid={!!errors.title}
          errorText={errors.title?.message}
          labelBadge={showEditedBadges && dirtyFields.title && <EditedBadge />}
        />

        <Controller
          control={control}
          name="sharingType"
          render={({ field }) => (
            <Field.Root invalid={!!errors.sharingType}>
              <Select.Root<SharingTypeOption>
                collection={collection}
                value={field.value ? [field.value] : []}
                onValueChange={(details) => field.onChange(details.value[0])}
                data-testid="sharingType"
              >
                <Select.HiddenSelect />
                <Flex>
                  <Select.Label>
                    {messages.sharingType.defaultMessage}
                  </Select.Label>
                  {showEditedBadges && dirtyFields.sharingType && (
                    <EditedBadge />
                  )}
                </Flex>
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText
                      placeholder={
                        messages.placeholderSelectSharingType.defaultMessage
                      }
                    />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {collection.items.map((item) => (
                        <Select.Item item={item} key={item.value}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
              {errors.sharingType && (
                <Field.ErrorText>{errors.sharingType.message}</Field.ErrorText>
              )}
            </Field.Root>
          )}
        />
      </FormGrid>

      <ButtonWrapper>
        <SubmitFormButton
          label={submitMessage}
          disabled={showEditedBadges && !isDirty}
          title={
            isDirty
              ? undefined
              : messages.disabledSaveButtonTooltip.defaultMessage
          }
        />
      </ButtonWrapper>
    </FormContainer>
  );
};

export default SessionForm;
