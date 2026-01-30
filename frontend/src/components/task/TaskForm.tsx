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
import { useRouter } from "next/router";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import {
  CreateSolutionTestDto,
  TaskType,
  UpdateReferenceSolutionDto,
} from "@/api/collimator/generated/models";
import { useNavigationObserver } from "@/utilities/navigation-observer";
import { getTaskTypeMessage } from "@/i18n/task-type-messages";
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
});

enum ModalStates {
  none = "none",
  quitNoSave = "quitNoSave",
  changeTypeConfirmation = "changeTypeConfirmation",
  destructiveConfirmation = "destructiveConfirmation",
  taskEdit = "taskEdit",
}

enum ActionTypes {
  editTask = "editTask",
  changeType = "changeType",
}

type DestructiveAction = ActionTypes.editTask | ActionTypes.changeType;

type TaskFormValues = {
  title: string;
  description: string;
  type: TaskType;
  taskFile: Blob | null;
  initialSolution: UpdateReferenceSolutionDto | null;
  initialSolutionFile: Blob | null;
};

type TaskTypeSession = {
  previousTaskType: TaskType;
  previousTaskFile: TaskFile;
};

type TaskFile = Blob | undefined | null;

export type TaskFormSubmission = {
  title: string;
  description: string;
  type: TaskType;
  taskFile: Blob | null;
  initialSolution: UpdateReferenceSolutionDto | null;
  initialSolutionFile: Blob | null;
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

const TaskForm = ({
  submitMessage,
  initialValues,
  onSubmit,
}: {
  submitMessage: MessageDescriptor;
  initialValues?: Partial<TaskFormValues>;
  onSubmit: (data: TaskFormSubmission) => Promise<void>;
}) => {
  const intl = useIntl();
  const router = useRouter();

  const [clearSolutionsOnSave, setClearSolutionsOnSave] = useState(false);

  const [openModal, setOpenModal] = useState<ModalStates>(ModalStates.none);
  const taskTypeSessionRef = useRef<TaskTypeSession | null>(null);

  const cannotNavigate = useRef(false);

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
  const title = watch("title");
  const description = watch("description");

  // this ref keeps track of the task type that has been confirmed by the user
  // it also matches what's saved or will be saved
  const committedTaskType = useRef<TaskType>(
    initialValues?.type ?? TaskType.SCRATCH,
  );

  const isCreateMode = router.pathname.includes("/create");

  const [pendingAction, setPendingAction] = useState<DestructiveAction | null>(
    null,
  );
  const [pendingTaskType, setPendingTaskType] = useState<TaskType | null>(null);

  const initialSolution = watch("initialSolution");
  const shouldStopNavigation = useCallback(() => cannotNavigate.current, []);
  const onNavigate = useCallback(() => {
    setOpenModal(ModalStates.quitNoSave);
  }, []);

  const navigate = useNavigationObserver({
    shouldStopNavigation,
    onNavigate,
  });

  useEffect(() => {
    // when the form becomes dirty, we do not allow navigation
    cannotNavigate.current = isDirty;
  }, [isDirty]);

  const onSubmitWrapper = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      let data: TaskFormValues;

      handleSubmit((v: TaskFormValues) => {
        data = v;

        return onSubmit({
          title: data.title,
          description: data.description,
          type: data.type,
          taskFile: data.taskFile,
          initialSolution: data.initialSolution,
          initialSolutionFile: data.initialSolutionFile,
        } satisfies TaskFormSubmission);
      })(e)
        .then(() => {
          // allow navigation after the task has been saved
          cannotNavigate.current = false;

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

          toaster.error({
            title: intl.formatMessage(messages.saveError),
            closable: true,
          });
        });
    },
    [handleSubmit, onSubmit, reset, intl],
  );

  const revertTaskType = useCallback(() => {
    if (!taskTypeSessionRef.current) {
      return;
    }

    setValueClean("type", taskTypeSessionRef.current.previousTaskType);

    committedTaskType.current = taskTypeSessionRef.current.previousTaskType;
  }, [setValueClean]);

  const revertTaskFile = useCallback(() => {
    if (!taskTypeSessionRef.current?.previousTaskFile) {
      return;
    }

    setValueClean("taskFile", taskTypeSessionRef.current.previousTaskFile);
  }, [setValueClean]);

  const revertTaskChanges = useCallback(() => {
    revertTaskType();
    revertTaskFile();

    taskTypeSessionRef.current = null;

    setClearSolutionsOnSave(false);
    setPendingTaskType(null);
  }, [revertTaskType, revertTaskFile]);

  const deleteSolutions = useCallback(() => {
    setClearSolutionsOnSave(true);
  }, []);

  const setNewTaskType = useCallback(
    (type: TaskType, clearFile: boolean = false) => {
      setValueClean("type", type);

      committedTaskType.current = type;

      if (!clearFile) {
        return;
      }

      // since task files are type specific, we delete the existing one explicitly
      setValueClean("taskFile", null);
    },
    [setValueClean],
  );

  const onConfirmChangeType = useCallback(() => {
    if (!pendingTaskType) {
      return;
    }

    cannotNavigate.current = false;
    const taskId = router.query.taskId as string | undefined;

    const queryParams = new URLSearchParams({
      type: pendingTaskType,
      title: title || "",
      description: description || "",
      replaceTaskId: taskId || "",
    });

    router.push(`/task/create?${queryParams.toString()}`);
  }, [pendingTaskType, title, description, router]);

  const onCancelChangeType = useCallback(() => {
    setValueClean("type", committedTaskType.current);

    setPendingTaskType(null);
  }, [setValueClean]);

  const setNewTask = useCallback(
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
    },
    [initialSolution, setValueClean],
  );

  const executeDestructiveAction = useCallback(
    (action: DestructiveAction) => {
      switch (action) {
        case ActionTypes.editTask:
          deleteSolutions();
          setOpenModal(ModalStates.taskEdit);
          break;

        case ActionTypes.changeType:
          if (pendingTaskType) {
            taskTypeSessionRef.current = {
              previousTaskType: committedTaskType.current,
              previousTaskFile: taskFile,
            };

            setNewTaskType(pendingTaskType, true);
            deleteSolutions();
            setOpenModal(ModalStates.taskEdit);
          }
          break;
      }

      setPendingAction(null);
    },
    [pendingTaskType, taskFile, deleteSolutions, setNewTaskType],
  );

  const requestDestructiveAction = useCallback(
    (action: DestructiveAction) => {
      if (hasReferenceSolutions) {
        // ask for confirmation if there are existing reference solutions
        setPendingAction(action);
        setOpenModal(ModalStates.destructiveConfirmation);
      } else {
        executeDestructiveAction(action);
      }
    },
    [hasReferenceSolutions, executeDestructiveAction],
  );

  useEffect(() => {
    if (taskType === committedTaskType.current) {
      return;
    }

    if (isCreateMode) {
      // in create mode, we do not need to confirm changing the type since there is no data loss
      committedTaskType.current = taskType;
      return;
    }

    setPendingTaskType(taskType);
    setOpenModal(ModalStates.changeTypeConfirmation);
  }, [taskType, isCreateMode]);

  const onConfirmDestructiveAction = useCallback(() => {
    if (pendingAction) {
      executeDestructiveAction(pendingAction);
    }
  }, [pendingAction, executeDestructiveAction]);

  const onCancelDestructiveAction = useCallback(() => {
    if (pendingAction === ActionTypes.changeType && pendingTaskType) {
      // restore the last confirmed task type when change type is canclled
      setValueClean("type", committedTaskType.current);
    }

    setPendingAction(null);
    setPendingTaskType(null);
  }, [pendingAction, pendingTaskType, setValueClean]);

  const handleEditModalClose = useCallback(
    (isShown: boolean) => {
      if (isShown) {
        setOpenModal(ModalStates.taskEdit);
        return;
      }

      setOpenModal(ModalStates.none);

      if (taskTypeSessionRef.current) {
        // revert changes if the user closes the edit modal without saving
        revertTaskChanges();
      }
    },
    [revertTaskChanges],
  );

  const clearSession = useCallback(() => {
    taskTypeSessionRef.current = null;
    setPendingTaskType(null);
  }, []);

  const handleEditModalSave = useCallback(
    (task: { file: Blob; initialSolution: Submission }) => {
      setNewTask(task);
      clearSession();
    },
    [setNewTask, clearSession],
  );

  const handleOpenEditTask = useCallback(() => {
    requestDestructiveAction(ActionTypes.editTask);
  }, [requestDestructiveAction]);

  // If the initialValues are provided and we are not in create mode, show the EditedBadge for fields that have been modified
  const showEditedBadges = !!initialValues && !isCreateMode;

  const closeModalIfActive =
    (state: ModalStates, onClose?: () => void) => (isShown: boolean) => {
      if (!isShown) {
        setOpenModal((current) =>
          current === state ? ModalStates.none : current,
        );
        onClose?.();
      }
    };

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
            />
            <TextArea
              label={messages.description}
              {...register("description")}
              data-testid="description"
              errorText={errors.description?.message}
              labelBadge={
                showEditedBadges && dirtyFields.description && <EditedBadge />
              }
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
              >
                {taskFile ? (
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
              >
                <Field.ErrorText>{errors.type?.message}</Field.ErrorText>
              </Select>
            </Field.Root>
          </GridItem>
        </Grid>
        <Box display="flex" justifyContent="flex-end">
          <SubmitFormButton
            label={submitMessage}
            disabled={!isDirty || !isValid}
          />
        </Box>
        <EditTaskModal
          isShown={openModal === ModalStates.taskEdit}
          setIsShown={handleEditModalClose}
          initialTask={taskFile}
          taskType={taskType}
          onSave={(task) => {
            setValue("taskFile", task.file, {
              shouldDirty: true,
              shouldValidate: true,
            });

            setValue("initialSolutionFile", task.initialSolution.file, {
              shouldDirty: true,
              shouldValidate: true,
            });

            setValue(
              "initialSolution",
              {
                // if possible, use the existing initial solution id,
                // otherwise set it to null and create a new one
                id: initialSolution?.id ?? null,
                title: "",
                description: "",
                isInitial: true,
                tests: createSubmissionTests(task.initialSolution),
              },
              {
                shouldDirty: true,
                shouldValidate: true,
              },
            );
          }}
        />
      </form>
      <ConfirmationModal
        isShown={openModal === ModalStates.quitNoSave}
        setIsShown={closeModalIfActive(ModalStates.quitNoSave)}
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
        setIsShown={closeModalIfActive(
          ModalStates.changeTypeConfirmation,
          onCancelChangeType,
        )}
        onConfirm={onConfirmChangeType}
        isDangerous
        messages={{
          title: messages.changeTypeConfirmationTitle,
          body: messages.changeTypeConfirmationBody,
          confirmButton: messages.changeTypeConfirmationButton,
        }}
      />

      <ConfirmationModal
        isShown={openModal === ModalStates.destructiveConfirmation}
        setIsShown={closeModalIfActive(
          ModalStates.destructiveConfirmation,
          onCancelDestructiveAction,
        )}
        onConfirm={onConfirmDestructiveAction}
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
