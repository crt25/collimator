import { useForm } from "react-hook-form";
import * as yup from "yup";
import { defineMessages, MessageDescriptor } from "react-intl";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import Input from "../form/Input";
import SubmitFormButton from "../form/SubmitFormButton";
import { EditedBadge } from "../EditedBadge";

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
  onSubmit: (data: LessonFormProps) => void | Promise<void>;
}) => {
  const schema = useYupSchema({
    name: yup.string().required(),
  });

  const resolver = useYupResolver(schema);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm<LessonFormProps>({
    resolver,
    defaultValues: initialValues,
  });

  // If the intiialValues are provided, show the EditedBadge for fields that have been modified
  const showEditedBadges = !!initialValues;

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
        reset(values);
      })}
    >
      <Input
        label={messages.name}
        errorText={errors.name?.message}
        {...register("name")}
        labelBadge={showEditedBadges && dirtyFields.name && <EditedBadge />}
      />
      <SubmitFormButton label={submitMessage} disabled={isSubmitting} />
    </form>
  );
};

export default LessonForm;
