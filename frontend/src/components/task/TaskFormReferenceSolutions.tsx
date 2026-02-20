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
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Submission } from "iframe-rpc-react/src";
import { Box, Field, HStack, Icon, Input } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import {
  CreateSolutionTestDto,
  TaskType,
  UpdateReferenceSolutionDto,
} from "@/api/collimator/generated/models";
import { useNavigationObserver } from "@/utilities/navigation-observer";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import SubmitFormButton from "../form/SubmitFormButton";
import Button from "../Button";
import SortableListInput from "../form/SortableList";
import SolveTaskModal from "../modals/SolveTaskModal";
import TextArea from "../form/TextArea";
import { toaster } from "../Toaster";

const AddReferenceSolutionButton = styled(Button)`
  margin: 1rem 0;
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

  input,
  textarea {
    width: 100%;
    resize: none;

    padding: 0.25rem 0.5rem;
  }

  button {
    width: fit-content;
  }
`;

const RemoveTask = styled.span`
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const logModule = "[TaskFormReferenceSolutions]";

const messages = defineMessages({
  title: {
    id: "TaskForm.title",
    defaultMessage: "Title",
  },
  description: {
    id: "TaskForm.description",
    defaultMessage: "Description",
  },
  testName: {
    id: "TaskForm.testName",
    defaultMessage: "Test name",
  },
  blobValidation: {
    id: "TaskFormReferenceSolutions.blobValidation",
    defaultMessage: "The provided file data is invalid",
  },
  referenceSolutionsLengthValidation: {
    id: "TaskFormReferenceSolutions.referenceSolutionsLengthValidation",
    defaultMessage:
      "The number of reference solutions must match the number of reference solution files",
  },
  closeConfirmationTitle: {
    id: "TaskFormReferenceSolutions.closeConfirmation.title",
    defaultMessage: "Attention: you may lose your work!",
  },
  closeConfirmationBody: {
    id: "TaskFormReferenceSolutions.closeConfirmation.body",
    defaultMessage:
      "You are about to leave the task editing interface without saving.\nAre you sure this is" +
      " what you want?",
  },
  closeConfirmationButton: {
    id: "TaskFormReferenceSolutions.closeConfirmation.button",
    defaultMessage: "Yes, I don't need to save.",
  },

  saveSuccess: {
    id: "TaskFormReferenceSolutions.SaveSuccess",
    defaultMessage: "The task was saved successfully.",
  },
  saveError: {
    id: "TaskFormReferenceSolutions.SaveError",
    defaultMessage: "An error occurred while saving the task. Try again later.",
  },
});

type CreateReferenceSolutionDtoWithId = UpdateReferenceSolutionDto & {
  // add synthetic id for sortable list
  id: number;
  isNew?: boolean;
};

type TaskFormReferenceSolutionsValues = {
  referenceSolutions: CreateReferenceSolutionDtoWithId[];
  referenceSolutionFiles: { [key: number]: Blob };
};

export type TaskFormReferenceSolutionsSubmission = {
  referenceSolutions: UpdateReferenceSolutionDto[];
  referenceSolutionsFiles: Blob[];
};

const getYupSchema = (intl: IntlShape) => {
  const referenceSolutionBase = {
    title: yup
      .string()
      .label(intl.formatMessage(messages.title))
      .required()
      .min(1)
      .max(200),
    description: yup
      .string()
      .label(intl.formatMessage(messages.description))
      .required()
      .min(1)
      .max(2000),
    isInitial: yup.boolean().required(),
    tests: yup
      .array(
        yup
          .object({
            identifier: yup.string().nullable().defined(),
            name: yup
              .string()
              .label(intl.formatMessage(messages.testName))
              .required()
              .min(1)
              .max(200),
            contextName: yup.string().nullable().defined(),
            passed: yup.boolean().required(),
          })
          .required(),
      )
      .required(),
  };

  const referenceSolutionWithId = yup
    .object({
      id: yup.number().required(),
      isNew: yup.boolean(),
      ...referenceSolutionBase,
    })
    .required();

  return {
    referenceSolutions: yup.array(referenceSolutionWithId).required(),
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

const TaskFormReferenceSolutions = ({
  taskType,
  taskFile,
  submitMessage,
  initialValues,
  onSubmit,
  disabled,
}: {
  taskType: TaskType;
  taskFile: Blob;
  submitMessage: MessageDescriptor;
  initialValues?: Partial<TaskFormReferenceSolutionsValues>;
  onSubmit: (data: TaskFormReferenceSolutionsSubmission) => Promise<void>;
  disabled?: boolean;
}) => {
  const intl = useIntl();
  const [showQuitNoSaveModal, setShowQuitNoSaveModal] = useState(false);
  const [showSolveTaskModalForId, setShowSolveTaskModalForId] = useState<
    null | number
  >(null);
  const [solutionFile, setSolutionFile] = useState<Blob | null>(null);
  const cannotNavigate = useRef(false);

  const schema = useYupSchema(getYupSchema(intl)) satisfies yup.ObjectSchema<{
    referenceSolutions: CreateReferenceSolutionDtoWithId[];

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
    handleSubmit,
    formState: { errors, isDirty, isValid },
    watch,
    reset,
    setValue,
  } = useForm<TaskFormReferenceSolutionsValues & { _fileChanged: boolean }>({
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
      console.log(
        "length of solution files",
        Object.keys(watch("referenceSolutionFiles")).length,
      );

      setReferenceSolutions(newReferenceSolutions);
    },
    [referenceSolutions, setReferenceSolutions, watch],
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

  const onSubmitWrapper = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      let data: TaskFormReferenceSolutionsValues;

      handleSubmit((v: TaskFormReferenceSolutionsValues) => {
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

        return onSubmit({
          referenceSolutions,
          referenceSolutionsFiles,
        } satisfies TaskFormReferenceSolutionsSubmission);
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

  const referenceSolutionFiles: { [key: number]: Blob } = watch(
    "referenceSolutionFiles",
  );

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

  const shouldShowSaveButton = useMemo(
    () =>
      !disabled &&
      // only show the save button if there are reference solutions
      (referenceSolutions.length > 0 ||
        // or if there were initially reference solutions
        (initialValues?.referenceSolutions?.length ?? 0) > 0),
    [referenceSolutions, disabled, initialValues],
  );

  return (
    <>
      <form
        onSubmit={onSubmitWrapper}
        data-testid="task-reference-solutions-form"
      >
        <Field.Root
          invalid={
            !!errors.referenceSolutions || !!errors.referenceSolutionFiles
          }
        >
          <SortableListInput
            items={referenceSolutions}
            updateItems={setReferenceSolutions}
            testId="reference-solutions"
            enableSorting={!disabled}
          >
            {(solution, index) => (
              <ReferenceSolutionListElement
                key={solution.id}
                data-testid={`solution-${solution.id}`}
              >
                <div>
                  <Field.Root>
                    <Field.Label
                      data-testid={`reference-solution-${solution.id}-title`}
                    >
                      {intl.formatMessage(messages.title)}
                    </Field.Label>
                    <Input
                      variant="subtle"
                      value={solution.title}
                      data-testid={`reference-solution-${solution.id}-title-input`}
                      onChange={(e) =>
                        updateReferenceSolution(index, {
                          ...referenceSolutions[index],
                          title: e.target.value,
                        })
                      }
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label
                      data-testid={`reference-solution-${solution.id}-description`}
                    >
                      {intl.formatMessage(messages.description)}
                    </Field.Label>

                    <TextArea
                      variant="subtle"
                      rows={5}
                      value={solution.description}
                      data-testid={`reference-solution-${solution.id}-description-input`}
                      onChange={(e) =>
                        updateReferenceSolution(index, {
                          ...referenceSolutions[index],
                          description: e.target.value,
                        })
                      }
                    />
                  </Field.Root>
                  {!disabled && (
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
                          id="TaskFormReferenceSolutions.solution.edit"
                          defaultMessage="Edit reference solution in external application"
                        />
                      ) : (
                        <FormattedMessage
                          id="TaskFormReferenceSolutions.solution.create"
                          defaultMessage="Create reference solution in external application"
                        />
                      )}
                    </Button>
                  )}
                </div>
                {!disabled && (
                  <RemoveTask
                    data-testid={`remove-task-${solution.id}`}
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
                )}
              </ReferenceSolutionListElement>
            )}
          </SortableListInput>
          <Field.ErrorText>
            {errors.referenceSolutions?.message}
            {errors.referenceSolutionFiles?.message}
          </Field.ErrorText>
        </Field.Root>

        {!disabled && (
          <>
            <AddReferenceSolutionButton
              onClick={onAddReferenceSolution}
              type="button"
            >
              <HStack>
                <Icon>
                  <LuPlus />
                </Icon>
                <FormattedMessage
                  id="TaskFormReferenceSolutions.addReferenceSolution"
                  defaultMessage="Add reference solution"
                />
              </HStack>
            </AddReferenceSolutionButton>
            <SolveTaskModal
              isShown={showSolveTaskModalForId !== null}
              setIsShown={(isShown) =>
                setShowSolveTaskModalForId(
                  isShown ? showSolveTaskModalForId : null,
                )
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
          </>
        )}

        <Box display="flex" justifyContent="flex-end">
          {shouldShowSaveButton && (
            <SubmitFormButton
              label={submitMessage}
              disabled={!isDirty || !isValid}
              data-testid="task-reference-solutions-form-submit"
            />
          )}
        </Box>
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

export default TaskFormReferenceSolutions;
