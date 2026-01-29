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
  referenceSolutionsLengthValidation: {
    id: "TaskForm.referenceSolutionsLengthValidation",
    defaultMessage:
      "The number of reference solutions must match the number of reference solution files",
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
  saveSuccess: {
    id: "TaskForm.SaveSuccess",
    defaultMessage: "The task was saved successfully.",
  },
  saveError: {
    id: "TaskForm.SaveError",
    defaultMessage: "An error occurred while saving the task. Try again later.",
  },
});

type TaskFormValues = {
  title: string;
  description: string;
  type: TaskType;
  taskFile: Blob | null;
  initialSolution: UpdateReferenceSolutionDto | null;
  initialSolutionFile: Blob | null;
};

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
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showQuitNoSaveModal, setShowQuitNoSaveModal] = useState(false);
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

  const initialSolution = watch("initialSolution");
  const shouldStopNavigation = useCallback(() => cannotNavigate.current, []);
  const onNavigate = useCallback(() => {
    setShowQuitNoSaveModal(true);
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

  const taskFile: Blob | undefined | null = watch("taskFile");

  const taskType = watch("type");

    setPendingTaskType(taskType);
    setShowChangeTypeModal(true);
    setValue("type", committedTaskType.current, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [taskType, setValue]);

  const onConfirmChangeType = useCallback(() => {
    if (!pendingTaskType) {
      return;
    }

    taskTypeChangeSessionRef.current = {
      previousTaskType: committedTaskType.current,
      previousTaskFile: taskFile,
    };

    setValue("type", pendingTaskType);

    committedTaskType.current = pendingTaskType;

    setValue("taskFile", new Blob());

    setClearSolutionsOnSave(true);

    setShowChangeTypeModal(false);
    setShowEditTaskModal(true);
  }, [pendingTaskType, taskFile, setValue]);

  const onCancelChangeType = useCallback(() => {
    setPendingTaskType(null);
    setShowChangeTypeModal(false);
  }, []);

  const handleEditModalClose = useCallback(
    (isShown: boolean) => {
      setShowEditTaskModal(isShown);

      if (!isShown && taskTypeChangeSessionRef.current) {
        // if the modal was closed without saving, revert changes
        setValue("type", taskTypeChangeSessionRef.current.previousTaskType, {
          shouldDirty: true,
          shouldValidate: true,
        });
        committedTaskType.current =
          taskTypeChangeSessionRef.current.previousTaskType;

        if (taskTypeChangeSessionRef.current.previousTaskFile) {
          setValue(
            "taskFile",
            taskTypeChangeSessionRef.current.previousTaskFile,
            {
              shouldDirty: true,
              shouldValidate: true,
            },
          );
        }

        taskTypeChangeSessionRef.current = null;
        setClearSolutionsOnSave(false);
        setPendingTaskType(null);
      }
    },
    [setValue],
  );

  const handleEditModalSave = useCallback(
    (task: { file: Blob; initialSolution: Submission }) => {
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
        // if possible, use the existing initial solution id,
        // otherwise set it to null and create a new one
        {
          id: initialSolution?.id ?? null,
          title: "",
          description: "",
          isInitial: true,
          tests: createSubmissionTests(task.initialSolution),
        } satisfies UpdateReferenceSolutionDto,
        { shouldDirty: true, shouldValidate: true },
      );
    },
    [initialSolution, setValue],
  );

  const onConfirmClearSolutions = useCallback(() => {
    setShowClearSolutionsModal(false);
    setShowEditTaskModal(true);
  }, []);

  const onCancelClearSolutions = useCallback(() => {
    if (!taskTypeChangeSessionRef.current) {
      return;
    }

    setValue("type", taskTypeChangeSessionRef.current.previousTaskType);
    committedTaskType.current =
      taskTypeChangeSessionRef.current.previousTaskType;

    if (taskTypeChangeSessionRef.current.previousTaskFile) {
      setValue("taskFile", taskTypeChangeSessionRef.current.previousTaskFile);
    }

    taskTypeChangeSessionRef.current = null;
    setPendingTaskType(null);
    setShowClearSolutionsModal(false);
  }, [setValue]);

  const [showEditConfirmationModal, setShowEditConfirmationModal] =
    useState(false);

  // If the initialValues are provided, show the EditedBadge for fields that have been modified
  const showEditedBadges = !!initialValues;

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
                onClick={() => setShowEditTaskModal(true)}
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
          isShown={showEditTaskModal}
          setIsShown={setShowEditTaskModal}
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
