import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  defineMessages,
  FormattedMessage,
  IntlShape,
  MessageDescriptor,
  useIntl,
} from "react-intl";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import styled from "@emotion/styled";
import { Submission } from "iframe-rpc-react/src";
import { Box, Field, Grid, GridItem } from "@chakra-ui/react";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import {
  CreateSolutionTestDto,
  TaskType,
  UpdateReferenceSolutionDto,
} from "@/api/collimator/generated/models";
import { useNavigationObserver } from "@/utilities/navigation-observer";
import { getTaskTypeMessage } from "@/i18n/task-type-messages";
import { ConflictError } from "@/api/fetch";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Input from "../form/Input";
import SubmitFormButton from "../form/SubmitFormButton";
import TextArea from "../form/TextArea";
import Select from "../form/Select";
import Button from "../Button";
import EditTaskModal from "../modals/EditTaskModal";
import { EditedBadge } from "../EditedBadge";
import { toaster } from "../Toaster";

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
  saveSuccess: {
    id: "TaskForm.SaveSuccess",
    defaultMessage: "The task was saved successfully.",
  },
  saveError: {
    id: "TaskForm.SaveError",
    defaultMessage: "An error occurred while saving the task. Try again later.",
  },
  destructiveActionTitle: {
    id: "TaskForm.destructiveAction.title",
    defaultMessage: "This action will delete reference solutions",
  },
  destructiveActionBody: {
    id: "TaskForm.destructiveAction.body",
    defaultMessage:
      "This action will delete all reference solutions when you save the task. Are you sure you want to continue?",
  },
  destructiveActionButton: {
    id: "TaskForm.destructiveAction.button",
    defaultMessage: "Yes, continue",
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
  changeTypeConfirmationTitle: {
    id: "TaskForm.changeTypeConfirmation.title",
    defaultMessage: "Change task type",
  },
  changeTypeConfirmationBody: {
    id: "TaskForm.changeTypeConfirmation.body",
    defaultMessage:
      "Changing the task type will require you to recreate the task in the new format. The existing task and any existing reference solutions will be deleted when you save. This action cannot be undone. Are you sure you want to continue?",
  },
  changeTypeConfirmationButton: {
    id: "TaskForm.changeTypeConfirmation.button",
    defaultMessage: "Yes, change type",
  },
  taskFileRequired: {
    id: "TaskForm.taskFileRequired",
    defaultMessage: "A task file is required before saving.",
  },
  saveConflictError: {
    id: "TaskForm.SaveConflictError",
    defaultMessage:
      "The task is now in use by one or more classes and can no longer be modified.",
  },
});

enum ModalStates {
  none = "none",
  quitNoSave = "quitNoSave",
  changeTypeConfirmation = "changeTypeConfirmation",
  changeTaskFileConfirmation = "changeTaskFileConfirmation",
  taskEdit = "taskEdit",
}

type TaskFormValues = {
  title: string;
  description: string;
  type: TaskType;
  taskFile: Blob | null;
  initialSolution: UpdateReferenceSolutionDto | null;
  initialSolutionFile: Blob | null;
};

type TaskFile = Blob | undefined | null;

export type TaskFormSubmission = {
  title: string;
  description: string;
  type: TaskType;
  taskFile: Blob | null;
  initialSolution: UpdateReferenceSolutionDto | null;
  initialSolutionFile: Blob | null;
  clearAllReferenceSolutions: boolean;
};

const getYupSchema = (intl: IntlShape) => ({
  title: yup.string().required(),
  description: yup.string().defined(),
  type: yup.string().oneOf(Object.values(TaskType)).required(),
  taskFile: yup
    .mixed<Blob>()
    .test(
      "is-blob",
      intl.formatMessage(messages.blobValidation),
      (v) => v instanceof Blob || v === null,
    )
    .nullable()
    .defined(),
  initialSolutionFile: yup
    .mixed<Blob>()
    .test(
      "is-blob",
      intl.formatMessage(messages.blobValidation),
      (v) => v instanceof Blob || v === null,
    )
    .nullable()
    .defined(),
  initialSolution: yup
    .object({
      id: yup.number().nullable().defined(),
      title: yup.string().defined(),
      description: yup.string().defined(),
      isInitial: yup.boolean().required(),
      tests: yup
        .array(
          yup
            .object({
              identifier: yup.string().nullable().defined(),
              name: yup.string().required(),
              contextName: yup.string().nullable().defined(),
              passed: yup.boolean().required(),
            })
            .required(),
        )
        .required(),
    })
    .nullable()
    .defined(),
});

const createSubmissionTests = (
  submission: Submission,
): CreateSolutionTestDto[] => [
  ...submission.failedTests.map((t) => ({ ...t, passed: false })),
  ...submission.passedTests.map((t) => ({ ...t, passed: true })),
];

class NoTaskFileError extends Error {
  constructor() {
    super("No task file was provided");
  }
}

const TaskForm = ({
  submitMessage,
  initialValues,
  onSubmit,
  hasReferenceSolutions = false,
  onConflictError,
  disabled = false,
}: {
  submitMessage: MessageDescriptor;
  initialValues?: Partial<TaskFormValues>;
  onSubmit: (data: TaskFormSubmission) => Promise<void>;
  hasReferenceSolutions?: boolean;
  onConflictError?: () => void;
  disabled?: boolean;
}) => {
  const intl = useIntl();

  const [clearSolutionsOnSave, setClearSolutionsOnSave] = useState(false);

  const [openModal, setOpenModal] = useState<ModalStates>(ModalStates.none);

  // this tracks whether the user has confirmed a type change in this session
  // when true, the user can change the type without further confirmation and shows "Create" instead of "Edit" button
  const [hasTypeChanged, setHasTypeChanged] = useState(false);

  // this holds the type change awaiting user confirmation in the modal
  // it temporarily stores the new type while the confirmation modal is open
  const [pendingTypeChange, setPendingTypeChange] = useState<TaskType | null>(
    null,
  );

  const cannotNavigate = useRef(false);
  const confirmedActionRef = useRef(false);

  const [originalType, setOriginalType] = useState(
    initialValues?.type ?? TaskType.SCRATCH,
  );

  const schema = useYupSchema(getYupSchema(intl)) satisfies yup.ObjectSchema<{
    title: string;
    description: string;
    type: TaskType;
    taskFile: Blob | null;
    initialSolution: UpdateReferenceSolutionDto | null;
    initialSolutionFile: Blob | null;
  }>;

  const resolver = useYupResolver(schema);

  const defaultValues = useMemo(
    () => ({
      type: TaskType.SCRATCH,
      title: "",
      description: "",
      taskFile: null,
      initialSolution: null,
      initialSolutionFile: null,
      ...initialValues,
    }),
    [initialValues],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid, dirtyFields },
    watch,
    reset,
    setValue,
    control,
  } = useForm<TaskFormValues>({
    resolver,
    defaultValues,
  });

  const setValueClean = useCallback(
    <T extends keyof TaskFormValues>(
      field: keyof TaskFormValues,
      value: TaskFormValues[T],
    ) => {
      setValue(field, value, { shouldDirty: true, shouldValidate: true });
    },
    [setValue],
  );

  const taskFile: TaskFile = watch("taskFile");
  const taskType: TaskType = watch("type");
  const initialSolution = watch("initialSolution");

  // when the form becomes dirty, we do not allow navigation
  const shouldStopNavigation = useCallback(() => {
    cannotNavigate.current = isDirty;

    return cannotNavigate.current;
  }, [isDirty]);

  const onNavigate = useCallback(() => {
    setOpenModal(ModalStates.quitNoSave);
  }, []);

  const navigate = useNavigationObserver({
    shouldStopNavigation,
    onNavigate,
  });

  useEffect(() => {
    if (taskType === originalType) {
      return;
    }

    if (hasTypeChanged) {
      // at this point, if the user has already changed the type and confirmed,
      // we can just allow switching without further confirmation

      return;
    }

    setPendingTypeChange(taskType);
    setValueClean("type", originalType);
    setOpenModal(ModalStates.changeTypeConfirmation);
  }, [taskType, originalType, hasTypeChanged, setValueClean]);

  const onConfirmTypeChange = useCallback(() => {
    if (!pendingTypeChange) {
      return;
    }

    confirmedActionRef.current = true;
    setValueClean("type", pendingTypeChange);
    setValueClean("taskFile", null);
    setValueClean("initialSolution", null);
    setValueClean("initialSolutionFile", null);
    setHasTypeChanged(true);
    setClearSolutionsOnSave(true);
    setPendingTypeChange(null);
    setOpenModal(ModalStates.none);
  }, [pendingTypeChange, setValueClean]);

  const onCancelTypeChange = useCallback(() => {
    setPendingTypeChange(null);
    setOpenModal(ModalStates.none);
  }, []);

  const handleOpenEditTask = useCallback(() => {
    if (hasTypeChanged || !hasReferenceSolutions) {
      setOpenModal(ModalStates.taskEdit);
    } else {
      setOpenModal(ModalStates.changeTaskFileConfirmation);
    }
  }, [hasTypeChanged, hasReferenceSolutions]);

  const onConfirmChangeTaskFileAction = useCallback(() => {
    confirmedActionRef.current = true;
    setClearSolutionsOnSave(true);
    setOpenModal(ModalStates.taskEdit);
  }, []);

  const closeModal = useCallback(() => {
    setOpenModal(ModalStates.none);
  }, []);

  const handleEditModalSave = useCallback(
    (task: { file: Blob; initialSolution: Submission }) => {
      setValueClean("taskFile", task.file);
      setValueClean("initialSolutionFile", task.initialSolution.file);
      setValueClean(
        "initialSolution",
        // if possible, use the existing initial solution id,
        // otherwise set it to null and create a new one
        {
          id: initialSolution?.id ?? null,
          title: "",
          description: "",
          isInitial: true,
          tests: createSubmissionTests(task.initialSolution),
        } satisfies UpdateReferenceSolutionDto,
      );
      setOpenModal(ModalStates.none);
    },
    [initialSolution, setValueClean],
  );

  const onSubmitWrapper = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      let data: TaskFormValues;

      handleSubmit((v: TaskFormValues) => {
        data = v;

        // A null taskFile affects UI state:
        // - modal selection in task detail pages
        // - button text in this form
        // but more critically, the API requires a non-null taskFile for persistence.
        // Therefore, we block submission if taskFile is null.
        if (data.taskFile === null) {
          return Promise.reject(new NoTaskFileError());
        }

        return onSubmit({
          title: data.title,
          description: data.description,
          type: data.type,
          taskFile: data.taskFile,
          initialSolution: data.initialSolution,
          initialSolutionFile: data.initialSolutionFile,
          clearAllReferenceSolutions: clearSolutionsOnSave,
        } satisfies TaskFormSubmission);
      })(e)
        .then(() => {
          // allow navigation after the task has been saved
          cannotNavigate.current = false;

          if (data.type !== originalType) {
            // Update the "original" type to the newly saved type
            setOriginalType(data.type);
          }

          setHasTypeChanged(false);
          setClearSolutionsOnSave(false);

          // reset the form to the updated values
          // and mark the blob as not changed
          // so the user can navigate without confirmation
          reset(data);

          toaster.success({
            title: intl.formatMessage(messages.saveSuccess),
            closable: true,
          });
        })
        .catch((err) => {
          console.error(`${logModule} Error saving task`, err);

          if (err instanceof NoTaskFileError) {
            toaster.error({
              title: intl.formatMessage(messages.taskFileRequired),
              closable: true,
            });
          } else {
            toaster.error({
              title: intl.formatMessage(messages.saveError),
              closable: true,
            });
          }

          if (err instanceof ConflictError) {
            toaster.error({
              title: intl.formatMessage(messages.saveConflictError),
              closable: true,
            });
            onConflictError?.();
          } else {
            toaster.error({
              title: intl.formatMessage(messages.saveError),
              closable: true,
            });
          }
        });
    },
    [
      handleSubmit,
      onSubmit,
      reset,
      intl,
      clearSolutionsOnSave,
      onConflictError,
      originalType,
    ],
  );

  // If the initialValues are provided, show the EditedBadge for fields that have been modified
  const showEditedBadges = !!initialValues;
  const canSubmit = isDirty && isValid && taskFile !== null;

  return (
    <>
      <form onSubmit={onSubmitWrapper} data-testid="task-form">
        <Grid templateColumns="repeat(12, 1fr)" gap={4}>
          <GridItem colSpan={{ base: 12, md: 6 }}>
            <Input
              label={messages.title}
              {...register("title")}
              data-testid="title"
              errorText={errors.title?.message}
              labelBadge={
                showEditedBadges && dirtyFields.title && <EditedBadge />
              }
              disabled={disabled}
            />
            <TextArea
              label={messages.description}
              {...register("description")}
              data-testid="description"
              errorText={errors.description?.message}
              labelBadge={
                showEditedBadges && dirtyFields.description && <EditedBadge />
              }
              disabled={disabled}
            />

            <Field.Root
              invalid={
                !!errors.taskFile ||
                !!errors.initialSolution ||
                !!errors.initialSolutionFile
              }
            >
              <EditTaskButton
                data-testid="edit-task-button"
                type="button"
                onClick={handleOpenEditTask}
                disabled={disabled}
              >
                {hasTypeChanged || !taskFile ? (
                  <FormattedMessage
                    id="TaskForm.blob.create"
                    defaultMessage="Create task in external application"
                  />
                ) : (
                  <FormattedMessage
                    id="TaskForm.blob.edit"
                    defaultMessage="Edit task in external application"
                  />
                )}
              </EditTaskButton>

              <Field.ErrorText>
                {errors.taskFile?.message}
                {errors.initialSolution?.message}
                {errors.initialSolutionFile?.message}
              </Field.ErrorText>
            </Field.Root>
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 6 }}>
            <Field.Root>
              <Select
                name="type"
                control={control}
                alwaysShow
                label={messages.type}
                showEditedBadge={showEditedBadges}
                options={Object.values(TaskType).map((taskType) => ({
                  value: taskType,
                  label: getTaskTypeMessage(taskType as TaskType),
                }))}
                data-testid="type"
                disabled={disabled}
              >
                <Field.ErrorText>{errors.type?.message}</Field.ErrorText>
              </Select>
            </Field.Root>
          </GridItem>
        </Grid>
        {!disabled && (
          <Box display="flex" justifyContent="flex-end">
            <SubmitFormButton label={submitMessage} disabled={!canSubmit} />
          </Box>
        )}
        <EditTaskModal
          isShown={openModal === ModalStates.taskEdit}
          setIsShown={closeModal}
          initialTask={hasTypeChanged ? null : taskFile}
          taskType={taskType}
          onSave={handleEditModalSave}
        />
      </form>
      <ConfirmationModal
        isShown={openModal === ModalStates.quitNoSave}
        setIsShown={(isShown) => !isShown && setOpenModal(ModalStates.none)}
        onConfirm={navigate}
        isDangerous
        messages={{
          title: messages.closeConfirmationTitle,
          body: messages.closeConfirmationBody,
          confirmButton: messages.closeConfirmationButton,
        }}
      />

      <ConfirmationModal
        isShown={openModal === ModalStates.changeTypeConfirmation}
        setIsShown={(isShown) => {
          if (!isShown) {
            if (confirmedActionRef.current) {
              confirmedActionRef.current = false;
            } else {
              onCancelTypeChange();
            }
          }
        }}
        onConfirm={onConfirmTypeChange}
        isDangerous
        messages={{
          title: messages.changeTypeConfirmationTitle,
          body: messages.changeTypeConfirmationBody,
          confirmButton: messages.changeTypeConfirmationButton,
        }}
      />

      <ConfirmationModal
        isShown={openModal === ModalStates.changeTaskFileConfirmation}
        data-testid="change-task-file-confirmation-modal"
        setIsShown={(isShown) => {
          if (!isShown) {
            if (confirmedActionRef.current) {
              confirmedActionRef.current = false;
            } else {
              closeModal();
            }
          }
        }}
        onConfirm={onConfirmChangeTaskFileAction}
        isDangerous
        messages={{
          title: messages.destructiveActionTitle,
          body: messages.destructiveActionBody,
          confirmButton: messages.destructiveActionButton,
        }}
      />
    </>
  );
};

export default TaskForm;
