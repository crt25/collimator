import { useForm } from "react-hook-form";
import * as yup from "yup";
import { defineMessages, MessageDescriptor, useIntl } from "react-intl";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  Field,
  chakra,
  Grid,
  GridItem,
  HStack,
  Stack,
  Icon,
} from "@chakra-ui/react";
import { RiDraggable } from "react-icons/ri";
import router from "next/router";
import { MdAdd } from "react-icons/md";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import { useAllTasks } from "@/api/collimator/hooks/tasks/useAllTasks";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import { useNavigationObserver } from "@/utilities/navigation-observer";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import Select from "../form/Select";
import SubmitFormButton from "../form/SubmitFormButton";
import TextArea from "../form/TextArea";
import Input from "../form/Input";
import SwrContent from "../SwrContent";
import SortableListInput from "../form/SortableList";
import { EditedBadge } from "../EditedBadge";
import ConfirmationModal from "../modals/ConfirmationModal";

export enum SharingType {
  anonymous = "anonymous",
  private = "private",
}

const ButtonWrapper = chakra("div", {
  base: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "xl",
  },
});

const messages = defineMessages({
  title: {
    id: "CreateSessionForm.title",
    defaultMessage: "Title",
  },
  description: {
    id: "CreateSessionForm.description",
    defaultMessage: "Description",
  },
  tasks: {
    id: "CreateSessionForm.tasks",
    defaultMessage: "Tasks",
  },
  addTask: {
    id: "CreateSessionForm.addTask",
    defaultMessage: "Add Task",
  },
  selectTaskToAdd: {
    id: "CreateSessionForm.selectTaskToAdd",
    defaultMessage: "Select a task to add",
  },
  sharingType: {
    id: "CreateSessionForm.sharingType",
    defaultMessage: "Sharing Type",
  },
  sharingTypeAnonymous: {
    id: "SessionForm.sharingType.anonymous",
    defaultMessage: "Anonymous",
  },
  sharingTypePrivate: {
    id: "SessionForm.sharingType.private",
    defaultMessage: "Private",
  },
  closeConfirmationTitle: {
    id: "SessionForm.closeConfirmation.title",
    defaultMessage: "Attention: you may lose your work!",
  },
  closeConfirmationBody: {
    id: "SessionForm.closeConfirmation.body",
    defaultMessage:
      "You are about to leave without saving your changes.\nAre you sure this is what you want?",
  },
  closeConfirmationButton: {
    id: "SessionForm.closeConfirmation.button",
    defaultMessage: "Yes, discard changes",
  },
  createTask: {
    id: "SessionForm.createTask",
    defaultMessage: "Create Task",
  },
});

export interface SessionFormValues {
  title: string;
  description: string;
  taskIds: number[];
  sharingType: SharingType;
}

const StyledTaskListElement = styled.div<{ enableSorting: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  cursor: ${(props) => (props.enableSorting ? "grab" : "default")};
  &:active {
    cursor: ${(props) => (props.enableSorting ? "grabbing" : "default")};
  }
`;

const SortableListWrapper = styled.div`
  margin-bottom: 1rem;
`;

const RemoveTask = styled.span`
  cursor: pointer;
`;

const addTaskEmptyId = -1;

const SessionForm = ({
  submitMessage,
  initialValues,
  onSubmit,
  classId,
}: {
  submitMessage: MessageDescriptor;
  initialValues?: Partial<SessionFormValues>;
  onSubmit: (data: SessionFormValues) => void;
  classId: number;
}) => {
  const intl = useIntl();

  const schema = useYupSchema({
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
    taskIds: yup.array().of(yup.number().required()).required(),
    sharingType: yup
      .mixed<SharingType>()
      .label(intl.formatMessage(messages.sharingType))
      .oneOf(Object.values(SharingType))
      .required(),
  });

  const cannotNavigate = useRef(false);

  const [showQuitNoSaveModal, setShowQuitNoSaveModal] = useState(false);

  const resolver = useYupResolver(schema);

  const defaultValues = useMemo(
    () => ({
      ...initialValues,
      taskIds: initialValues?.taskIds ?? [],
    }),
    [initialValues],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, dirtyFields, isDirty, isValid },
    control,
  } = useForm<SessionFormValues>({
    resolver,
    defaultValues,
  });

  const { isLoading, data, error } = useAllTasks();

  const [selectedTasks, _setSelectedTasks] = useState<ExistingTask[]>([]);
  const [addTaskId, setAddTaskId] = useState(addTaskEmptyId);
  const selectedTaskIds = watch("taskIds");

  const { data: klass } = useClass(classId);
  const authenticationContext = useContext(AuthenticationContext);

  const isOwner = useMemo(() => {
    return (
      klass &&
      "userId" in authenticationContext &&
      klass.teacher.id === authenticationContext.userId
    );
  }, [klass, authenticationContext]);

  // If the initialValues are provided, show the EditedBadge for fields that have been modified
  const showEditedBadges = !!initialValues;

  // ensure that the selected tasks are always in sync with the form
  const setSelectedTasks = useCallback(
    (tasks: ExistingTask[]) => {
      _setSelectedTasks(tasks);
      setValue(
        "taskIds",
        tasks.map((t) => t.id),
        { shouldDirty: true },
      );
    },
    [setValue],
  );

  const onAddTask = useCallback(
    (taskIdString: string) => {
      const taskId = parseInt(taskIdString, 10);

      if (taskId === addTaskEmptyId) {
        return;
      }

      if (!data) {
        return;
      }

      const newTask = data.find((t) => t.id === taskId);

      if (!newTask) {
        return;
      }

      setSelectedTasks([...selectedTasks, newTask]);

      // reset the select
      setAddTaskId(addTaskEmptyId);

      return selectedTaskIds;
    },
    [selectedTaskIds, data, selectedTasks, setSelectedTasks],
  );

  // when the form becomes dirty, we do not allow navigation
  const shouldStopNavigation = useCallback(() => {
    cannotNavigate.current = isDirty;

    return cannotNavigate.current;
  }, [isDirty]);

  const onNavigate = useCallback(() => {
    setShowQuitNoSaveModal(true);
  }, []);

  const confirmNavigation = useNavigationObserver({
    shouldStopNavigation,
    onNavigate,
  });

  useEffect(() => {
    // initialize the selected tasks if we have data and the form is empty
    if (data && selectedTasks.length === 0 && selectedTaskIds.length > 0) {
      _setSelectedTasks(
        // map the taskIds to the actual tasks (correct order is provided by the backend)
        selectedTaskIds
          .map((taskId) => data.find((t) => t.id === taskId))
          .filter((t) => t !== undefined),
      );
    }
  }, [data, selectedTaskIds, selectedTasks, setSelectedTasks]);

  const TaskListElement = ({
    task,
    enableSorting,
    onRemove,
  }: {
    task: ExistingTask;
    enableSorting: boolean;
    onRemove: () => void;
  }) => {
    return (
      <StyledTaskListElement enableSorting={enableSorting}>
        <HStack>
          {enableSorting && <RiDraggable />}
          <span>{task.title}</span>
        </HStack>
        <RemoveTask data-testid="remove-task" onClick={onRemove}>
          <FontAwesomeIcon icon={faTrash} />
        </RemoveTask>
      </StyledTaskListElement>
    );
  };

  const enableSorting = useMemo(
    () => selectedTasks.length > 1 && isOwner,
    [selectedTasks, isOwner],
  );

  return (
    <SwrContent isLoading={isLoading} error={error} data={data}>
      {(tasks) => (
        <>
          <form
            onSubmit={handleSubmit((values) => {
              onSubmit(values);
              reset(values);
            })}
            data-testid="session-form"
          >
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
                    showEditedBadges &&
                    dirtyFields.description && <EditedBadge />
                  }
                />

                <SortableListWrapper>
                  <Field.Root>
                    <Stack>
                      <Field.Label>
                        {intl.formatMessage(messages.tasks)}
                      </Field.Label>
                      <SortableListInput
                        items={selectedTasks}
                        updateItems={setSelectedTasks}
                        testId="selected-tasks"
                        enableSorting={enableSorting}
                      >
                        {(task, _, enableSorting) => (
                          <TaskListElement
                            task={task}
                            enableSorting={enableSorting}
                            onRemove={() =>
                              setSelectedTasks(
                                selectedTasks.filter((t) => t !== task),
                              )
                            }
                          />
                        )}
                      </SortableListInput>
                    </Stack>
                  </Field.Root>
                </SortableListWrapper>

                {isOwner && (
                  <Select
                    label={messages.addTask}
                    options={[
                      {
                        value: addTaskEmptyId.toString(),
                        label: messages.selectTaskToAdd,
                      },
                      // in theory tasks should never be undefined, but it seems to happen sometimes??
                      // TODO: investigate why this happens
                      ...(Array.isArray(tasks) ? tasks : [])
                        // don't list again tasks that are already selected
                        .filter((t) => !selectedTaskIds.includes(t.id))
                        .map((t) => ({
                          value: t.id.toString(),
                          label: t.title,
                        })),
                    ]}
                    data-testid="add-task"
                    onValueChange={onAddTask}
                    value={addTaskId.toString()}
                    marginTop="lg"
                  />
                )}
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Select
                  name="sharingType"
                  control={control}
                  showEditedBadge={showEditedBadges}
                  label={messages.sharingType}
                  data-testid="sharing-type"
                  options={[
                    {
                      value: SharingType.anonymous,
                      label: messages.sharingTypeAnonymous,
                    },
                    {
                      value: SharingType.private,
                      label: messages.sharingTypePrivate,
                    },
                  ]}
                />
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <ButtonWrapper>
                  <Button
                    variant="primary"
                    onClick={() => {
                      const currentUrl = router.asPath;
                      const returnUrl = encodeURIComponent(currentUrl);
                      router.push(`/task/create?returnUrl=${returnUrl}`);
                    }}
                    data-testid="task-create-button"
                    marginTop="md"
                  >
                    <HStack>
                      <Icon>
                        <MdAdd />
                      </Icon>
                      {intl.formatMessage(messages.createTask)}
                    </HStack>
                  </Button>
                </ButtonWrapper>
              </GridItem>
            </Grid>

            <SubmitFormButton
              label={submitMessage}
              disabled={!isDirty || !isValid}
            />
          </form>
          <ConfirmationModal
            isShown={showQuitNoSaveModal}
            setIsShown={setShowQuitNoSaveModal}
            onConfirm={confirmNavigation}
            isDangerous
            messages={{
              title: messages.closeConfirmationTitle,
              body: messages.closeConfirmationBody,
              confirmButton: messages.closeConfirmationButton,
            }}
          />
        </>
      )}
    </SwrContent>
  );
};

export default SessionForm;
