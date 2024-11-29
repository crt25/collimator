import { useForm } from "react-hook-form";
import * as yup from "yup";
import ValidationErrorMessage from "../form/ValidationErrorMessage";
import Input from "../form/Input";
import {
  defineMessages,
  FormattedMessage,
  MessageDescriptor,
  useIntl,
} from "react-intl";
import SubmitFormButton from "../form/SubmitFormButton";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import { TaskType } from "@/api/collimator/generated/models";
import TextArea from "../form/TextArea";
import Select from "../form/Select";
import { getTaskTypeMessage } from "@/i18n/task-type-messages";
import Button from "../Button";
import styled from "@emotion/styled";
import EditTaskModal from "../modals/EditTaskModal";
import { useMemo, useState } from "react";

const EditTaskButton = styled(Button)`
  margin-top: 1rem;
`;

const messages = defineMessages({
  title: {
    id: "TaskForm.title",
    defaultMessage: "Title",
  },
  description: {
    id: "TaskForm.description",
    defaultMessage: "Description",
  },
  type: {
    id: "TaskForm.type",
    defaultMessage: "Type",
  },
  blobValidation: {
    id: "TaskForm.blobValidation",
    defaultMessage: "The provided file data is invalid",
  },
});

export type TaskFormValues = {
  title: string;
  description: string;
  type: TaskType;

  blob: Blob;
  blobChanged?: boolean;
};

const TaskForm = ({
  submitMessage,
  initialValues,
  onSubmit,
}: {
  submitMessage: MessageDescriptor;
  initialValues?: Partial<TaskFormValues>;
  onSubmit: (data: TaskFormValues) => void;
}) => {
  const intl = useIntl();
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);

  const schema = useYupSchema({
    title: yup.string().required(),
    description: yup.string().required(),
    type: yup.string().oneOf(Object.values(TaskType)).required(),
    blob: yup
      .mixed()
      .test(
        "is-blob",
        intl.formatMessage(messages.blobValidation),
        (v): v is Blob => v instanceof Blob,
      )
      .required(),
    blobChanged: yup.boolean(),
  }) as yup.ObjectSchema<{
    title: string;
    description: string;
    type: TaskType;
    blob: Blob;
    blobChanged?: boolean;
  }>;

  const resolver = useYupResolver(schema);

  const defaultValues = useMemo(
    () => ({
      ...initialValues,
      // when initializating the form, the blob has not yet changed
      blobChanged: false,
    }),
    [initialValues],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    watch,
    setValue,
  } = useForm<TaskFormValues>({
    resolver,
    defaultValues,
  });

  const blob = watch("blob") as Blob | undefined | null;
  const taskType = watch("type");

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="task-form">
      <Input label={messages.title} {...register("title")} data-testid="title">
        <ValidationErrorMessage>{errors.title?.message}</ValidationErrorMessage>
      </Input>

      <TextArea
        label={messages.description}
        {...register("description")}
        data-testid="description"
      >
        <ValidationErrorMessage>
          {errors.description?.message}
        </ValidationErrorMessage>
      </TextArea>

      <Select
        alwaysShow
        label={messages.type}
        options={Object.values(TaskType).map((taskType) => ({
          value: taskType,
          label: getTaskTypeMessage(taskType as TaskType),
        }))}
        {...register("type")}
        data-testid="type"
      >
        <EditTaskButton
          data-testid="edit-task-button"
          onClick={(e) => {
            e.preventDefault();
            setShowEditTaskModal(true);
          }}
        >
          {blob ? (
            <FormattedMessage
              id="TaskForm.blob.edit"
              defaultMessage="Edit task in external application"
            />
          ) : (
            <FormattedMessage
              id="TaskForm.blob.create"
              defaultMessage="Create task in external application"
            />
          )}
        </EditTaskButton>

        <ValidationErrorMessage>{errors.type?.message}</ValidationErrorMessage>
      </Select>

      <EditTaskModal
        isShown={showEditTaskModal}
        setIsShown={setShowEditTaskModal}
        initialTask={blob}
        taskType={taskType}
        onSave={(task) => {
          setValue("blob", task, { shouldDirty: true, shouldValidate: true });
          setValue("blobChanged", true, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      />
      <ValidationErrorMessage>{errors.blob?.message}</ValidationErrorMessage>
      <ValidationErrorMessage>
        {errors.blobChanged?.message}
      </ValidationErrorMessage>

      {blob && (
        <SubmitFormButton
          label={submitMessage}
          disabled={!isDirty || !isValid}
        />
      )}
    </form>
  );
};

export default TaskForm;
