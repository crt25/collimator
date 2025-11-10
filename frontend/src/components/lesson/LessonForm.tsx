import { useForm } from "react-hook-form";
import * as yup from "yup";
import { defineMessages, MessageDescriptor } from "react-intl";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import Input from "../form/Input";
import SubmitFormButton from "../form/SubmitFormButton";

const messages = defineMessages({
  name: {
    id: "CreateLessonForm.name",
    defaultMessage: "Name",
  },
});

type LessonFormProps = {
  name: string;
};

const LessonForm = ({
  submitMessage,
  initialValues,
  onSubmit,
}: {
  submitMessage: MessageDescriptor;
  initialValues?: LessonFormProps;
  onSubmit: (data: LessonFormProps) => void;
}) => {
  const schema = useYupSchema({
    name: yup.string().required(),
  });

  const resolver = useYupResolver(schema);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonFormProps>({
    resolver,
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label={messages.name}
        errorText={errors.name?.message}
        {...register("name")}
      />
      <SubmitFormButton label={submitMessage} />
    </form>
  );
};

export default LessonForm;
