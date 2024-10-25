import { useForm } from "react-hook-form";
import * as yup from "yup";
import ValidationErrorMessage from "../form/ValidationErrorMessage";
import { defineMessages } from "react-intl";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import Select from "../form/Select";

const messages = defineMessages({
  lesson: {
    id: "CreateSessionForm.lesson",
    defaultMessage: "Lesson",
  },
});

export interface CreateSessionFormValues {
  lessonId: number;
}

export interface SessionFormRef {
  triggerSubmit: () => void;
}

interface SessionFormProps {
  lessonOptions: { value: number; label: string }[];
  onSubmit: (values: CreateSessionFormValues) => void;
}

const CreateSessionForm = forwardRef<SessionFormRef, SessionFormProps>(
  function SessionForm({ lessonOptions, onSubmit }, ref) {
    const schema = useYupSchema({
      lessonId: yup.number().required(),
    });

    const resolver = useYupResolver(schema);

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<CreateSessionFormValues>({
      resolver,
    });

    const triggerSubmit = useMemo(
      () => handleSubmit(onSubmit),
      [handleSubmit, onSubmit],
    );

    useImperativeHandle(ref, () => ({ triggerSubmit }), [triggerSubmit]);

    return (
      <form onSubmit={triggerSubmit}>
        <Select
          label={messages.lesson}
          options={lessonOptions}
          {...register("lessonId")}
        >
          <ValidationErrorMessage>
            {errors.lessonId?.message}
          </ValidationErrorMessage>
        </Select>
      </form>
    );
  },
);

export default CreateSessionForm;
