import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { UserRole } from "@/types/user/user-role";
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
import Checkbox from "../form/Checkbox";
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
  saveConflictError: {
    id: "TaskForm.SaveConflictError",
    defaultMessage:
      "The task is now in use by one or more classes and can no longer be modified.",
  },
  isPublicLabel: {
    id: "TaskForm.isPublic",
    defaultMessage: "This task is public",
  },
});

type TaskFormValues = {
  title: string;
  description: string;
  type: TaskType;
  taskFile: Blob;
  initialSolution: UpdateReferenceSolutionDto | null;
  initialSolutionFile: Blob | null;
  isPublic: boolean;
};

export type TaskFormSubmission = {
  title: string;
  description: string;
  type: TaskType;
  taskFile: Blob;
  initialSolution: UpdateReferenceSolutionDto | null;
  initialSolutionFile: Blob | null;
  isPublic: boolean;
};

const getYupSchema = (intl: IntlShape) => ({
  title: yup.string().required(),
  description: yup.string().defined(),
  type: yup.string().oneOf(Object.values(TaskType)).required(),
  isPublic: yup.boolean().defined(),
  taskFile: yup
    .mixed<Blob>()
    .test(
      "is-blob",
      intl.formatMessage(messages.blobValidation),
      (v) => v instanceof Blob,
    )
    .required(),
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
  onConflictError,
  disabled = false,
}: {
  submitMessage: MessageDescriptor;
  initialValues?: Partial<TaskFormValues>;
  onSubmit: (data: TaskFormSubmission) => Promise<void>;
  onConflictError?: () => void;
  disabled?: boolean;
}) => {
  const intl = useIntl();
  const authenticationContext = useContext(AuthenticationContext);
  const isAdmin = authenticationContext.role === UserRole.admin;
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showQuitNoSaveModal, setShowQuitNoSaveModal] = useState(false);
  const cannotNavigate = useRef(false);

  const schema = useYupSchema(getYupSchema(intl)) satisfies yup.ObjectSchema<{
    title: string;
    description: string;
    type: TaskType;
    taskFile: Blob;
    initialSolution: UpdateReferenceSolutionDto | null;
    initialSolutionFile: Blob | null;
    isPublic: boolean;
  }>;

  const resolver = useYupResolver(schema);

  const defaultValues = useMemo(
    () => ({
      type: TaskType.SCRATCH,
      title: "",
      description: "",
      isPublic: false,
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
          isPublic: data.isPublic,
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
    [handleSubmit, onSubmit, reset, intl, onConflictError],
  );

  const taskFile: Blob | undefined | null = watch("taskFile");

  const taskType = watch("type");

  // If the intiialValues are provided, show the EditedBadge for fields that have been modified
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

            {isAdmin && (
              <Checkbox
                name="isPublic"
                control={control}
                label={messages.isPublicLabel}
                showEditedBadge={showEditedBadges}
                data-testid="isPublic"
                disabled={disabled}
              />
            )}

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
                disabled={disabled}
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
                disabled={disabled}
              >
                <Field.ErrorText>{errors.type?.message}</Field.ErrorText>
              </Select>
            </Field.Root>
          </GridItem>
        </Grid>
        {!disabled && (
          <Box display="flex" justifyContent="flex-end">
            <SubmitFormButton
              label={submitMessage}
              disabled={!isDirty || !isValid}
            />
          </Box>
        )}
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
