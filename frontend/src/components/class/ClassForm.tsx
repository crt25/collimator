import { useForm } from "react-hook-form";
import * as yup from "yup";
import { defineMessages, MessageDescriptor, useIntl } from "react-intl";
import { chakra, Field, Grid, GridItem } from "@chakra-ui/react";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import { useAllUsers } from "@/api/collimator/hooks/users/useAllUsers";
import Input from "../form/Input";
import SwrContent from "../SwrContent";
import FormContainer from "../form/FormContainer";
import { EditedBadge } from "../EditedBadge";
import SubmitFormButton from "../form/SubmitFormButton";
import Select from "../form/Select";

const ButtonWrapper = chakra("div", {
  base: {
    display: "flex",
    justifyContent: "flex-end",
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
    reset,
    handleSubmit,
    formState: { errors, dirtyFields },
    control,
  } = useForm<ClassFormValues>({
    resolver,
    defaultValues: initialValues,
  });

  const { isLoading, data, error } = useAllUsers();

  // If the intiialValues are provided, show the EditedBadge for fields that have been modified
  const showEditedBadges = !!initialValues;

  return (
    <SwrContent isLoading={isLoading} error={error} data={data}>
      {(users) => (
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
                  label={messages.teacher}
                  showEditedBadge={showEditedBadges}
                  options={users.map((u) => ({
                    value: u.id.toString(),
                    label: u.name ?? u.email,
                  }))}
                  data-testid="teacherId"
                >
                  <Field.ErrorText>{errors.teacherId?.message}</Field.ErrorText>
                </Select>
              </Field.Root>
            </GridItem>
          </Grid>

          <ButtonWrapper>
            <SubmitFormButton label={submitMessage} />
          </ButtonWrapper>
        </FormContainer>
      )}
    </SwrContent>
  );
};

export default ClassForm;
