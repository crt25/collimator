import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  defineMessages,
  FormattedMessage,
  IntlShape,
  MessageDescriptor,
  useIntl,
} from "react-intl";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as yup from "yup";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Submission } from "app-iframe-message-react/src";
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
import ValidationErrorMessage from "../form/ValidationErrorMessage";
import Input from "../form/Input";
import SubmitFormButton from "../form/SubmitFormButton";
import TextArea from "../form/TextArea";
import Select from "../form/Select";
import Button from "../Button";
import EditTaskModal from "../modals/EditTaskModal";
import SortableListInput from "../form/SortableList";
import SolveTaskModal from "../modals/SolveTaskModal";

const EditTaskButton = styled(Button)`
  margin-top: 1rem;
`;

const AddReferenceSolutionButton = styled(Button)`
  margin-bottom: 1rem;
`;

const ReferenceSolutionListElement = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  gap: 1rem;

  & > div {
    flex-grow: 1;

    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label,
  label > span {
    display: block;
  }

  input,
  textarea {
    width: 100%;
    resize: none;

    padding: 0.25rem 0.5rem;
  }
`;

const RemoveTask = styled.span`
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
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
});

type CreateReferenceSolutionDtoWithId = UpdateReferenceSolutionDto & {
  // add synthetic id for sortable list
  id: number;
  isNew?: boolean;
};

type TaskFormValues = {
  title: string;
  description: string;
  type: TaskType;
  referenceSolutions: CreateReferenceSolutionDtoWithId[];
  taskFile: Blob;
  initialSolution: UpdateReferenceSolutionDto | null;
  initialSolutionFile: Blob | null;
  referenceSolutionFiles: { [key: number]: Blob };
};

export type TaskFormSubmission = {
  title: string;
  description: string;
  type: TaskType;
  taskFile: Blob;
  referenceSolutions: UpdateReferenceSolutionDto[];
  referenceSolutionsFiles: Blob[];
};

const getYupSchema = (intl: IntlShape) => {
  const referenceSolutionBase = {
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
  };

  const referenceSolution = yup
    .object({
      id: yup.number().nullable().defined(),
      ...referenceSolutionBase,
    })
    .nullable()
    .defined();

  const referenceSolutionWithId = yup
    .object({
      id: yup.number().required(),
      isNew: yup.boolean(),
      ...referenceSolutionBase,
    })
    .required();

  return {
    title: yup.string().required(),
    description: yup.string().defined(),
    type: yup.string().oneOf(Object.values(TaskType)).required(),
    referenceSolutions: yup.array(referenceSolutionWithId).required(),
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
    initialSolution: referenceSolution,
    referenceSolutionFiles: yup
      .mixed<{ [key: number]: Blob }>()
      .test(
        "is-blob-map",
        intl.formatMessage(messages.blobValidation),
        (v) =>
          typeof v === "object" &&
          Object.values(v).every((v) => v instanceof Blob),
      )
      .required()
      .test(
        "length-match",
        intl.formatMessage(messages.referenceSolutionsLengthValidation),
        (blobMap, { parent: { referenceSolutions } }) =>
          Array.isArray(referenceSolutions) &&
          Object.values(blobMap).length === referenceSolutions.length,
      )
      .required(),
    _fileChanged: yup.boolean().required(),
  };
};

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
  const [showSolveTaskModalForId, setShowSolveTaskModalForId] = useState<
    null | number
  >(null);
  const [solutionFile, setSolutionFile] = useState<Blob | null>(null);
  const cannotNavigate = useRef(false);

  const schema = useYupSchema(getYupSchema(intl)) satisfies yup.ObjectSchema<{
    title: string;
    description: string;
    type: TaskType;
    referenceSolutions: CreateReferenceSolutionDtoWithId[];
    taskFile: Blob;
    initialSolution: UpdateReferenceSolutionDto | null;
    initialSolutionFile: Blob | null;
    referenceSolutionFiles: { [key: number]: Blob };
    _fileChanged: boolean;
  }>;

  const resolver = useYupResolver(schema);

  const defaultValues = useMemo(
    () => ({
      type: TaskType.SCRATCH,
      title: "",
      description: "",
      referenceSolutionFiles: [],
      referenceSolutions: [],
      ...initialValues,
      _fileChanged: false,
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
  } = useForm<TaskFormValues & { _fileChanged: boolean }>({
    resolver,
    defaultValues,
  });

  const referenceSolutions = watch("referenceSolutions");

  // ensure that the selected tasks are always in sync with the form
  const setReferenceSolutions = useCallback(
    (referenceSolutions: CreateReferenceSolutionDtoWithId[]) => {
      setValue("referenceSolutions", referenceSolutions, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const updateReferenceSolution = useCallback(
    (index: number, solution: CreateReferenceSolutionDtoWithId) => {
      const newReferenceSolutions = [...referenceSolutions];
      newReferenceSolutions[index] = solution;

      setReferenceSolutions(newReferenceSolutions);
    },
    [referenceSolutions, setReferenceSolutions],
  );

  const onAddReferenceSolution = useCallback(
    () =>
      setReferenceSolutions([
        ...referenceSolutions,
        {
          // add unique synthetic id that will be removed later
          id: Math.max(...referenceSolutions.map((s) => s.id), 0) + 1,
          isNew: true,
          isInitial: false,
          title: "",
          description: "",
          tests: [],
        },
      ]),
    [referenceSolutions, setReferenceSolutions],
  );

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

  const router = useRouter();

  const onSubmitWrapper = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      let data: TaskFormValues;

      handleSubmit((v: TaskFormValues) => {
        data = v;

        const referenceSolutions = data.referenceSolutions
          .toSorted((a, b) => a.id - b.id)
          .map((solution) => ({
            ...solution,
            id: solution.isNew ? null : solution.id,
          }));

        const referenceSolutionsFiles = Object.entries(
          data.referenceSolutionFiles,
        )
          .toSorted(([a, _], [b, __]) => parseInt(a) - parseInt(b))
          .map(([_id, file]) => file);

        if (data.initialSolution && data.initialSolutionFile) {
          referenceSolutions.push({
            ...data.initialSolution,
            id: null,
          });

          referenceSolutionsFiles.push(data.initialSolutionFile);
        }

        return onSubmit({
          title: data.title,
          description: data.description,
          type: data.type,
          taskFile: data.taskFile,
          referenceSolutions,
          referenceSolutionsFiles,
        } satisfies TaskFormSubmission);
      })(e)
        .then(() => {
          // allow navigation after the task has been saved
          cannotNavigate.current = false;

          // reset the form to the updated values
          // and mark the blob as not changed
          // so the user can navigate without confirmation
          reset(data);

          toast.success(
            <FormattedMessage
              id="TaskForm.SaveSuccess"
              defaultMessage="The task was saved successfully."
            />,
            { position: "top-center" },
          );

          router.back();
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
    [handleSubmit, onSubmit, reset, router],
  );

  const taskFile: Blob | undefined | null = watch("taskFile");

  const referenceSolutionFiles: { [key: number]: Blob } = watch(
    "referenceSolutionFiles",
  );
  const taskType = watch("type");

  const openSolutionModal = useCallback(
    (solutionId: number, solution: Blob | null) => {
      if (showSolveTaskModalForId !== null) {
        throw new Error("Cannot open new modal while another is open");
      }

      setSolutionFile(solution);
      setShowSolveTaskModalForId(solutionId);
    },
    [showSolveTaskModalForId],
  );

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

          <ValidationErrorMessage>
            {errors.type?.message}
          </ValidationErrorMessage>
        </Select>
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
                id: null,
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
        <ValidationErrorMessage>
          {errors.taskFile?.message}
        </ValidationErrorMessage>
        <ValidationErrorMessage>
          {errors.initialSolution?.message}
        </ValidationErrorMessage>
        <ValidationErrorMessage>
          {errors.initialSolutionFile?.message}
        </ValidationErrorMessage>

        <h2>
          <FormattedMessage
            id="TaskForm.referenceSolutions"
            defaultMessage="Reference Solutions"
          />
        </h2>
        <SortableListInput
          items={referenceSolutions}
          updateItems={setReferenceSolutions}
          testId="reference-solutions"
        >
          {(solution, index) => (
            <ReferenceSolutionListElement>
              <div>
                <label>
                  <span>{intl.formatMessage(messages.title)}</span>
                  <input
                    value={solution.title}
                    onChange={(e) =>
                      updateReferenceSolution(index, {
                        ...referenceSolutions[index],
                        title: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>{intl.formatMessage(messages.description)}</span>
                  <textarea
                    rows={5}
                    value={solution.description}
                    onChange={(e) =>
                      updateReferenceSolution(index, {
                        ...referenceSolutions[index],
                        description: e.target.value,
                      })
                    }
                  />
                </label>
                <Button
                  data-testid={`edit-solution-button-${solution.id}`}
                  type="button"
                  onClick={() =>
                    openSolutionModal(
                      solution.id,
                      referenceSolutionFiles[solution.id] ?? null,
                    )
                  }
                >
                  {referenceSolutionFiles[solution.id] ? (
                    <FormattedMessage
                      id="TaskForm.solution.edit"
                      defaultMessage="Edit solution in external application"
                    />
                  ) : (
                    <FormattedMessage
                      id="TaskForm.solution.create"
                      defaultMessage="Create solution in external application"
                    />
                  )}
                </Button>
              </div>
              <RemoveTask
                data-testid="remove-task"
                onClick={() => {
                  setReferenceSolutions(
                    referenceSolutions.filter((s) => s !== solution),
                  );

                  const newObject = { ...referenceSolutionFiles };
                  delete newObject[solution.id];

                  setValue("referenceSolutionFiles", newObject, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </RemoveTask>
            </ReferenceSolutionListElement>
          )}
        </SortableListInput>
        <AddReferenceSolutionButton
          onClick={onAddReferenceSolution}
          type="button"
        >
          <FormattedMessage
            id="TaskForm.addReferenceSolution"
            defaultMessage="Add"
          />
        </AddReferenceSolutionButton>
        <SolveTaskModal
          isShown={showSolveTaskModalForId !== null}
          setIsShown={(isShown) =>
            setShowSolveTaskModalForId(isShown ? showSolveTaskModalForId : null)
          }
          taskType={taskType}
          task={taskFile}
          solution={solutionFile}
          onSave={(solution) => {
            if (showSolveTaskModalForId === null) {
              throw new Error(
                `Modal onSave was called while showSolveTaskModalForIndex is ${showSolveTaskModalForId}`,
              );
            }

            const index = referenceSolutions.findIndex(
              (s) => s.id === showSolveTaskModalForId,
            );

            updateReferenceSolution(index, {
              ...referenceSolutions[index],
              tests: createSubmissionTests(solution),
            });

            setValue(
              "referenceSolutionFiles",
              {
                ...referenceSolutionFiles,
                [showSolveTaskModalForId]: solution.file,
              },
              { shouldDirty: true, shouldValidate: true },
            );

            // react hook form does not detect the file change, so we need to set it manually
            setValue("_fileChanged", true, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />

        {taskFile && (
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
