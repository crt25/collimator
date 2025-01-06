import { useForm } from "react-hook-form";
import * as yup from "yup";
import { defineMessages, MessageDescriptor } from "react-intl";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import { useAllUsers } from "@/api/collimator/hooks/users/useAllUsers";
import SubmitFormButton from "../form/SubmitFormButton";
import Input from "../form/Input";
import ValidationErrorMessage from "../form/ValidationErrorMessage";
import SwrContent from "../SwrContent";
import Select from "../form/Select";

const messages = defineMessages({
  name: {
    id: "ClassForm.name",
    defaultMessage: "Name",
  },
  teacher: {
    id: "ClassForm.teacher",
    defaultMessage: "Teacher",
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
  const schema = useYupSchema({
    name: yup.string().required(),
    teacherId: yup.number().required(),
  });

  const resolver = useYupResolver(schema);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver,
    defaultValues: initialValues,
  });

  const { isLoading, data, error } = useAllUsers();

  return (
    <SwrContent isLoading={isLoading} error={error} data={data}>
      {(users) => (
        <form onSubmit={handleSubmit(onSubmit)} data-testid="class-form">
          <Input label={messages.name} {...register("name")} data-testid="name">
            <ValidationErrorMessage>
              {errors.name?.message}
            </ValidationErrorMessage>
          </Input>

          <Select
            label={messages.teacher}
            options={users.map((u) => ({
              value: u.id,
              label: u.name ?? u.email,
            }))}
            {...register("teacherId")}
            data-testid="teacherId"
          >
            <ValidationErrorMessage>
              {errors.teacherId?.message}
            </ValidationErrorMessage>
          </Select>

          <SubmitFormButton label={submitMessage} />
        </form>
      )}
    </SwrContent>
  );
};

export default ClassForm;
