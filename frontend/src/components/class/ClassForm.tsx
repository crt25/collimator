import { useForm } from "react-hook-form";
import * as yup from "yup";
import { defineMessages, MessageDescriptor, useIntl } from "react-intl";
import { chakra, Field, Grid, GridItem } from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import { useAllUsers } from "@/api/collimator/hooks/users/useAllUsers";
import { useNavigationObserver } from "@/utilities/navigation-observer";
import Input from "../form/Input";
import SwrContent from "../SwrContent";
import FormContainer from "../form/FormContainer";
import { EditedBadge } from "../EditedBadge";
import SubmitFormButton from "../form/SubmitFormButton";
import Select from "../form/Select";
import ConfirmationModal from "../modals/ConfirmationModal";

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
  disabledSaveButtonTooltip: {
    id: "ClassForm.tooltip.disabledSaveButton",
    defaultMessage: "No changes to save",
  },
  closeConfirmationTitle: {
    id: "ClassForm.closeConfirmation.title",
    defaultMessage: "Attention: you may lose your work!",
  },
  closeConfirmationBody: {
    id: "ClassForm.closeConfirmation.body",
    defaultMessage:
      "You are about to leave without saving your changes.\nAre you sure this is what you want?",
  },
  closeConfirmationButton: {
    id: "ClassForm.closeConfirmation.button",
    defaultMessage: "Yes, discard changes",
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
    name: yup
      .string()
      .label(intl.formatMessage(messages.name))
      .required()
      .min(1)
      .max(100),
    teacherId: yup.number().required(),
  });

  const cannotNavigate = useRef(false);

  const [showQuitNoSaveModal, setShowQuitNoSaveModal] = useState(false);

  const resolver = useYupResolver(schema);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, dirtyFields, isDirty, isSubmitting },
    control,
  } = useForm<ClassFormValues>({
    resolver,
    defaultValues: initialValues,
  });

  const { isLoading, data, error } = useAllUsers();

  const showEditedBadges = !!initialValues;

  // Disable the button if in edit mode with no changes, or if the form is submitting
  const isButtonDisabled = (showEditedBadges && !isDirty) || isSubmitting;

  // when the form becomes dirty, we do not allow navigation
  const shouldStopNavigation = useCallback(() => {
    cannotNavigate.current = isDirty;

    return cannotNavigate.current;
  }, [isDirty]);

  const onNavigate = useCallback(() => {
    setShowQuitNoSaveModal(true);
  }, []);

  const confirmNavigation = useNavigationObserver({
    shouldStopNavigation,
    onNavigate,
  });

  return (
    <SwrContent isLoading={isLoading} error={error} data={data}>
      {(users) => (
        <>
          <FormContainer
            as="form"
            onSubmit={handleSubmit((values) => {
              onSubmit(values);
              reset(values);
            })}
            data-testid="class-form"
          >
            <Grid templateColumns="repeat(12, 1fr)" gap={4}>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Input
                  label={messages.name}
                  {...register("name")}
                  data-testid="name"
                  invalid={!!errors.name}
                  errorText={errors.name?.message}
                  labelBadge={
                    showEditedBadges && dirtyFields.name && <EditedBadge />
                  }
                />
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Field.Root>
                  <Select
                    name="teacherId"
                    control={control}
                    alwaysShow
                    label={messages.teacher}
                    showEditedBadge={showEditedBadges}
                    options={users.map((u) => ({
                      value: u.id.toString(),
                      label: u.name ?? u.email,
                    }))}
                    data-testid="teacherId"
                  />
                </Field.Root>
              </GridItem>
            </Grid>

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
          <ConfirmationModal
            isShown={showQuitNoSaveModal}
            setIsShown={setShowQuitNoSaveModal}
            onConfirm={confirmNavigation}
            isDangerous
            messages={{
              title: messages.closeConfirmationTitle,
              body: messages.closeConfirmationBody,
              confirmButton: messages.closeConfirmationButton,
            }}
          />
        </>
      )}
    </SwrContent>
  );
};

export default ClassForm;
