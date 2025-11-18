import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { defineMessages, MessageDescriptor, useIntl } from "react-intl";
import {
  Portal,
  Select,
  createListCollection,
  chakra,
  Field,
  Flex,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import { useAllUsers } from "@/api/collimator/hooks/users/useAllUsers";
import Input from "../form/Input";
import SwrContent from "../SwrContent";
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
  name: {
    id: "ClassForm.name",
    defaultMessage: "Name",
  },
  teacher: {
    id: "ClassForm.teacher",
    defaultMessage: "Teacher",
  },
  placeholderSelectTeacher: {
    id: "ClassForm.placeholder.selectTeacher",
    defaultMessage: "Select Teacher",
  },
  nameRequired: {
    id: "ClassForm.error.nameRequired",
    defaultMessage: "Name is required",
  },
  teacherRequired: {
    id: "ClassForm.error.teacherRequired",
    defaultMessage: "Teacher is required",
  },
});

export type ClassFormValues = {
  name: string;
  teacherId: number;
};

const ClassForm = ({
  submitMessage,
  initialValues,
  onSubmit,
}: {
  submitMessage: MessageDescriptor;
  initialValues?: ClassFormValues;
  onSubmit: (data: ClassFormValues) => void;
}) => {
  const intl = useIntl();

  const schema = useYupSchema({
    name: yup.string().required(intl.formatMessage(messages.nameRequired)),
    teacherId: yup
      .number()
      .required(intl.formatMessage(messages.teacherRequired)),
  });

  const resolver = useYupResolver(schema);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      dirtyFields,
      isDirty,
      isSubmitSuccessful,
      isSubmitting,
    },
    control,
    reset,
    clearErrors,
  } = useForm<ClassFormValues>({
    resolver,
    defaultValues: initialValues,
  });

  const { isLoading, data, error } = useAllUsers();

  const showEditedBadges = !!initialValues;

  useEffect(() => {
    if (isSubmitSuccessful) {
      if (showEditedBadges) {
        reset(undefined, { keepValues: true });
      }
    }
  }, [clearErrors, isSubmitSuccessful, reset, showEditedBadges]);

  // Disable the button if in edit mode with no changes, or if the form is submitting or has been successfully submitted
  const isButtonDisabled =
    (showEditedBadges && !isDirty) || isSubmitSuccessful || isSubmitting;

  type TeacherOption = {
    value: string;
    label: string;
  };

  return (
    <SwrContent isLoading={isLoading} error={error} data={data}>
      {(users) => {
        const collection = createListCollection<TeacherOption>({
          items: users.map((u) => ({
            value: u.id.toString(),
            label: u.name ?? u.email,
          })),
        });

        return (
          <FormContainer
            as="form"
            onSubmit={handleSubmit(onSubmit)}
            data-testid="class-form"
          >
            <FormGrid>
              <Input
                label={messages.name}
                {...register("name")}
                data-testid="name"
                variant="inputForm"
                invalid={!!errors.name}
                errorText={errors.name?.message}
                labelBadge={
                  showEditedBadges && dirtyFields.name && <EditedBadge />
                }
              />

              <Controller
                control={control}
                name="teacherId"
                render={({ field }) => (
                  <Field.Root invalid={!!errors.teacherId}>
                    <Select.Root<TeacherOption>
                      collection={collection}
                      value={field.value ? [field.value.toString()] : []}
                      onValueChange={(details) =>
                        field.onChange(Number.parseInt(details.value[0]))
                      }
                      data-testid="teacherId"
                    >
                      <Select.HiddenSelect />
                      <Flex>
                        <Select.Label>
                          {intl.formatMessage(messages.teacher)}
                        </Select.Label>
                        {showEditedBadges && dirtyFields.teacherId && (
                          <EditedBadge />
                        )}
                      </Flex>
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText
                            placeholder={intl.formatMessage(
                              messages.placeholderSelectTeacher,
                            )}
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
                    {errors.teacherId && (
                      <Field.ErrorText>
                        {errors.teacherId.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>
                )}
              />
            </FormGrid>

            <ButtonWrapper>
              <SubmitFormButton
                label={submitMessage}
                disabled={isButtonDisabled}
                title={
                  isDirty
                    ? undefined
                    : intl.formatMessage(messages.disabledSaveButtonTooltip)
                }
              />
            </ButtonWrapper>
          </FormContainer>
        );
      }}
    </SwrContent>
  );
};

export default ClassForm;
