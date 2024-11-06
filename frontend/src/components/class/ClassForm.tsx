import { useForm } from "react-hook-form";
import * as yup from "yup";
import ValidationErrorMessage from "../form/ValidationErrorMessage";
import Input from "../form/Input";
import { defineMessages, MessageDescriptor } from "react-intl";
import SubmitFormButton from "../form/SubmitFormButton";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";

const messages = defineMessages({
  name: {
    id: "CreateClassForm.name",
    defaultMessage: "Name",
  },
});

export type ClassFormValues = {
  name: string;
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input label={messages.name} {...register("name")}>
        <ValidationErrorMessage>{errors.name?.message}</ValidationErrorMessage>
      </Input>

      <SubmitFormButton label={submitMessage} />
    </form>
  );
};

export default ClassForm;
