import { useForm } from "react-hook-form";
import * as yup from "yup";
import { defineMessages, MessageDescriptor } from "react-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Grid, GridItem } from "@chakra-ui/react";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import { useAllTasks } from "@/api/collimator/hooks/tasks/useAllTasks";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import Select from "../form/Select";
import SubmitFormButton from "../form/SubmitFormButton";
import TextArea from "../form/TextArea";
import Input from "../form/Input";
import SwrContent from "../SwrContent";
import SortableListInput from "../form/SortableList";
import { EditedBadge } from "../EditedBadge";

export enum SharingType {
  anonymous = "anonymous",
  private = "private",
}

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
});

export interface SessionFormValues {
  title: string;
  description: string;
  taskIds: number[];
  sharingType: SharingType;
}

const TaskListElement = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const RemoveTask = styled.span`
  cursor: pointer;
`;

const addTaskEmptyId = -1;

const SessionForm = ({
  submitMessage,
  initialValues,
  onSubmit,
}: {
  submitMessage: MessageDescriptor;
  initialValues?: Partial<SessionFormValues>;
  onSubmit: (data: SessionFormValues) => void;
}) => {
  const schema = useYupSchema({
    title: yup.string().required(),
    description: yup.string().required(),
    taskIds: yup.array().of(yup.number().required()).required(),
    sharingType: yup
      .mixed<SharingType>()
      .oneOf(Object.values(SharingType))
      .required(),
  });

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
    formState: { errors, dirtyFields },
    control,
  } = useForm<SessionFormValues>({
    resolver,
    defaultValues,
  });

  const { isLoading, data, error } = useAllTasks();

  const [selectedTasks, _setSelectedTasks] = useState<ExistingTask[]>([]);
  const [addTaskId, setAddTaskId] = useState(addTaskEmptyId);
  const selectedTaskIds = watch("taskIds");

  // If the initialValues are provided, show the EditedBadge for fields that have been modified
  const showEditedBadges = !!initialValues;

  // ensure that the selected tasks are always in sync with the form
  const setSelectedTasks = useCallback(
    (tasks: ExistingTask[]) => {
      _setSelectedTasks(tasks);
      setValue(
        "taskIds",
        tasks.map((t) => t.id),
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

  return (
    <SwrContent isLoading={isLoading} error={error} data={data}>
      {(tasks) => (
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
                  showEditedBadges && dirtyFields.description && <EditedBadge />
                }
              />
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
          </Grid>

          <SortableListInput
            items={selectedTasks}
            updateItems={setSelectedTasks}
            testId="selected-tasks"
          >
            {(task) => (
              <TaskListElement>
                <span>{task.title}</span>
                <RemoveTask
                  data-testid="remove-task"
                  onClick={() =>
                    setSelectedTasks(selectedTasks.filter((t) => t !== task))
                  }
                >
                  <FontAwesomeIcon icon={faTrash} />
                </RemoveTask>
              </TaskListElement>
            )}
          </SortableListInput>

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
          />

          <SubmitFormButton label={submitMessage} />
        </form>
      )}
    </SwrContent>
  );
};

export default SessionForm;
