import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  defineMessages,
  FormattedMessage,
  MessageDescriptor,
  useIntl,
} from "react-intl";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as yup from "yup";
import styled from "@emotion/styled";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import { TaskType } from "@/api/collimator/generated/models";
import { useNavigationObserver } from "@/utilities/navigation-observer";
import { getTaskTypeMessage } from "@/i18n/task-type-messages";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import ValidationErrorMessage from "../form/ValidationErrorMessage";
import Input from "../form/Input";
import SubmitFormButton from "../form/SubmitFormButton";
import TextArea from "../form/TextArea";
import Select from "../form/Select";
import Button from "../Button";
import EditTaskModal from "../modals/EditTaskModal";

const EditTaskButton = styled(Button)`
  margin-top: 1rem;
`;

const logModule = "[TaskForm]";

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
  closeConfirmationTitle: {
    id: "TaskForm.closeConfirmation.title",
    defaultMessage: "Attention: you may lose your work!",
  },
  closeConfirmationBody: {
    id: "TaskForm.closeConfirmation.body",
    defaultMessage:
      "You are about to leave the task editing interface without saving.\nAre you sure this is" +
      " what you want?",
  },
  closeConfirmationButton: {
    id: "TaskForm.closeConfirmation.button",
    defaultMessage: "Yes, I don't need to save.",
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
  onSubmit: (data: TaskFormValues) => Promise<void>;
}) => {
  const intl = useIntl();
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showQuitNoSaveModal, setShowQuitNoSaveModal] = useState(false);
  const cannotNavigate = useRef(false);

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
    reset,
    setValue,
  } = useForm<TaskFormValues>({
    resolver,
    defaultValues,
  });

  const navigate = useNavigationObserver({
    shouldStopNavigation: () => cannotNavigate.current,
    onNavigate: () => {
      setShowQuitNoSaveModal(true);
    },
  });

  useEffect(() => {
    // when the form becomes dirty, we do not allow navigation
    cannotNavigate.current = isDirty;
  }, [isDirty]);

  const onSubmitWrapper = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      // store the current value of canNavigate
      const canNavigateNow = cannotNavigate.current;

      // allow navigation in the processing of the form submission
      cannotNavigate.current = false;

      let data: TaskFormValues;

      handleSubmit((v: TaskFormValues) => {
        data = v;
        return onSubmit(v);
      })(e)
        .then(() => {
          // restore the value of canNavigate
          cannotNavigate.current = canNavigateNow;

          // reset the form to the updated values
          // and mark the blob as not changed
          // so the user can navigate without confirmation
          reset({
            ...data,
            blobChanged: false,
          });

          toast.success(
            <FormattedMessage
              id="TaskForm.SaveSuccess"
              defaultMessage="The task was saved successfully."
            />,
            { position: "top-center" },
          );
        })
        .catch((err) => {
          console.error(`${logModule} Error saving task`, err);
          toast.error(
            <FormattedMessage
              id="TaskForm.SaveError"
              defaultMessage="An error occurred while saving the task. Try again later."
            />,
            { position: "top-center" },
          );
        });
    },
    [handleSubmit, onSubmit, reset],
  );

  const blob = watch("blob") as Blob | undefined | null;
  const taskType = watch("type");

  return (
    <>
      <form onSubmit={onSubmitWrapper} data-testid="task-form">
        <Input
          label={messages.title}
          {...register("title")}
          data-testid="title"
        >
          <ValidationErrorMessage>
            {errors.title?.message}
          </ValidationErrorMessage>
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

          <ValidationErrorMessage>
            {errors.type?.message}
          </ValidationErrorMessage>
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
      <ConfirmationModal
        isShown={showQuitNoSaveModal}
        setIsShown={setShowQuitNoSaveModal}
        onConfirm={navigate}
        isDangerous
        messages={{
          title: messages.closeConfirmationTitle,
          body: messages.closeConfirmationBody,
          confirmButton: messages.closeConfirmationButton,
        }}
      />
    </>
  );
};

export default TaskForm;
