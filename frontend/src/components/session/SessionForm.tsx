import { useForm } from "react-hook-form";
import * as yup from "yup";
import { defineMessages, MessageDescriptor } from "react-intl";
import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
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
  isAnonymous: {
    id: "CreateSessionForm.isAnonymous",
    defaultMessage: "Whether students are anonymous when working on tasks.",
  },
});

export interface SessionFormValues {
  title: string;
  description: string;
  taskIds: number[];
  isAnonymous: boolean;
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
    isAnonymous: yup.boolean().required(),
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
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver,
    defaultValues,
  });

  const { isLoading, data, error } = useAllTasks();

  const [selectedTasks, _setSelectedTasks] = useState<ExistingTask[]>([]);
  const [addTaskId, setAddTaskId] = useState(addTaskEmptyId);
  const selectedTaskIds = watch("taskIds");

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
    (event: SyntheticEvent<HTMLSelectElement, Event>) => {
      const taskId = parseInt(event.currentTarget.value, 10);

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
        <form onSubmit={handleSubmit(onSubmit)} data-testid="session-form">
          <Input
            label={messages.title}
            {...register("title")}
            data-testid="title"
            errorText={errors.title?.message}
          />

          <TextArea
            label={messages.description}
            {...register("description")}
            data-testid="description"
            errorText={errors.description?.message}
          />

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
                value: addTaskEmptyId,
                label: messages.selectTaskToAdd,
              },
              // in theory tasks should never be undefined, but it seems to happen sometimes??
              // TODO: investigate why this happens
              ...(Array.isArray(tasks) ? tasks : [])
                // don't list again tasks that are already selected
                .filter((t) => !selectedTaskIds.includes(t.id))
                .map((t) => ({
                  value: t.id,
                  label: t.title,
                })),
            ]}
            data-testid="add-task"
            onChange={onAddTask}
            value={addTaskId}
          />

          <Input
            label={messages.isAnonymous}
            {...register("isAnonymous")}
            data-testid="is-anonymous"
            type="checkbox"
            errorText={errors.isAnonymous?.message}
          />

          <SubmitFormButton label={submitMessage} />
        </form>
      )}
    </SwrContent>
  );
};

export default SessionForm;
