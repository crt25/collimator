import { useForm } from "react-hook-form";
import * as yup from "yup";
import { defineMessages, MessageDescriptor } from "react-intl";
import { useMemo } from "react";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import { omitNullValues, PartialNullable } from "@/utilities/type";
import { UserType } from "@/api/collimator/generated/models";
import { getUserTypeMessage } from "@/i18n/user-type-messages";
import ValidationErrorMessage from "../form/ValidationErrorMessage";
import Input from "../form/Input";
import SubmitFormButton from "../form/SubmitFormButton";
import Select from "../form/Select";
import { EditedBadge } from "../EditedBadge";

const messages = defineMessages({
  name: {
    id: "UserForm.name",
    defaultMessage: "Name",
  },
  email: {
    id: "UserForm.email",
    defaultMessage: "Email address",
  },
  type: {
    id: "UserForm.role",
    defaultMessage: "Role",
  },
});

export type UserFormValues = {
  name: string;
  email: string;
  type: UserType;
};

const UserForm = ({
  submitMessage,
  initialValues,
  onSubmit,
}: {
  submitMessage: MessageDescriptor;
  initialValues?: PartialNullable<UserFormValues>;
  onSubmit: (data: UserFormValues) => void;
}) => {
  const schema = useYupSchema({
    name: yup.string().required(),
    email: yup.string().email().required(),
    type: yup.string().oneOf(Object.values(UserType)).required(),
  });

  const resolver = useYupResolver(schema);

  const defaultValues = useMemo(
    () =>
      // Default role to TEACHER if not provided
      initialValues
        ? omitNullValues({
            ...initialValues,
            type: initialValues.type ?? UserType.TEACHER,
          })
        : {
            type: UserType.TEACHER,
          },
    [initialValues],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, dirtyFields },
  } = useForm<UserFormValues>({
    resolver,
    defaultValues,
  });

  // If the intiialValues are provided, show the EditedBadge for fields that have been modified
  const showEditedBadges = !!initialValues;

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="user-form">
      <Input
        label={messages.name}
        {...register("name")}
        data-testid="name"
        invalid={!!errors.name}
        errorText={errors.name?.message}
        labelBadge={showEditedBadges && dirtyFields.name && <EditedBadge />}
      />

      <Input
        label={messages.email}
        {...register("email")}
        data-testid="email"
        invalid={!!errors.email}
        errorText={errors.email?.message}
        labelBadge={showEditedBadges && dirtyFields.email && <EditedBadge />}
      />

      <Select
        name="type"
        control={control}
        label={messages.type}
        options={Object.values(UserType).map((userType) => ({
          value: userType,
          label: getUserTypeMessage(userType as UserType),
        }))}
        data-testid="type"
      >
        <ValidationErrorMessage>{errors.type?.message}</ValidationErrorMessage>
      </Select>

      <SubmitFormButton label={submitMessage} />
    </form>
  );
};

export default UserForm;
