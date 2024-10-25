import { useForm } from "react-hook-form";
import * as yup from "yup";
import ValidationErrorMessage from "../form/ValidationErrorMessage";
import Input from "../form/Input";
import { defineMessages, MessageDescriptor } from "react-intl";
import SubmitFormButton from "../form/SubmitFormButton";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import { Lesson } from "./LessonList";

const messages = defineMessages({
  name: {
    id: "CreateLessonForm.name",
    defaultMessage: "Name",
  },
});

const LessonForm = ({
  submitMessage,
  initialValues,
}: {
  submitMessage: MessageDescriptor;
  initialValues?: Lesson;
}) => {
  const schema = useYupSchema({
    name: yup.string().required(),
  });

  const resolver = useYupResolver(schema);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ name: string }>({
    resolver,
    defaultValues: initialValues,
  });

  const onSubmit = (data: unknown) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input label={messages.name} {...register("name")}>
        <ValidationErrorMessage>{errors.name?.message}</ValidationErrorMessage>
      </Input>

      <SubmitFormButton label={submitMessage} />
    </form>
  );
};

export default LessonForm;
