import { useForm } from "react-hook-form";
import * as yup from "yup";
import ValidationErrorMessage from "../form/ValidationErrorMessage";
import Input from "../form/Input";
import { defineMessages, MessageDescriptor } from "react-intl";
import SubmitFormButton from "../form/SubmitFormButton";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import { omitNullValues, PartialNullable } from "@/utilities/type";
import { useMemo } from "react";
import Select from "../form/Select";
import { UserType } from "@/api/collimator/generated/models";
import { getUserTypeMessage } from "@/i18n/user-type-messages";

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
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver,
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="user-form">
      <Input label={messages.name} {...register("name")} data-testid="name">
        <ValidationErrorMessage>{errors.name?.message}</ValidationErrorMessage>
      </Input>

      <Input label={messages.email} {...register("email")} data-testid="email">
        <ValidationErrorMessage>{errors.email?.message}</ValidationErrorMessage>
      </Input>

      <Select
        label={messages.type}
        options={Object.values(UserType).map((userType) => ({
          value: userType,
          label: getUserTypeMessage(userType as UserType),
        }))}
        {...register("type")}
        data-testid="type"
      >
        <ValidationErrorMessage>{errors.type?.message}</ValidationErrorMessage>
      </Select>

      <SubmitFormButton label={submitMessage} />
    </form>
  );
};

export default UserForm;
