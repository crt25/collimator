import { useForm } from "react-hook-form";
import * as yup from "yup";
import ValidationErrorMessage from "../form/ValidationErrorMessage";
import { defineMessages, MessageDescriptor } from "react-intl";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import Select from "../form/Select";
import SubmitFormButton from "../form/SubmitFormButton";
import TextArea from "../form/TextArea";
import Input from "../form/Input";
import { useAllTasks } from "@/api/collimator/hooks/tasks/useAllTasks";
import SwrContent from "../SwrContent";
import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import SortableListInput from "../form/SortableList";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

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
});

export interface SessionFormValues {
  title: string;
  description: string;
  taskIds: number[];
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
  });

  const resolver = useYupResolver(schema);

  const defaultValues = useMemo(
    () => ({ ...initialValues, taskIds: initialValues?.taskIds ?? [] }),
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
  const taskIds = watch("taskIds");

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

      return taskIds;
    },
    [taskIds, data, selectedTasks, setSelectedTasks],
  );

  useEffect(() => {
    // initialize the selected tasks if we have data and the form is empty
    if (data && selectedTasks.length === 0 && taskIds.length > 0) {
      _setSelectedTasks(
        // map the taskIds to the actual tasks (correct order is provided by the backend)
        taskIds
          .map((taskId) => data.find((t) => t.id === taskId))
          .filter((t) => t !== undefined),
      );
    }
  }, [data, taskIds, selectedTasks, setSelectedTasks]);

  return (
    <SwrContent isLoading={isLoading} error={error} data={data}>
      {(tasks) => (
        <form onSubmit={handleSubmit(onSubmit)}>
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

          <SortableListInput
            items={selectedTasks}
            updateItems={setSelectedTasks}
          >
            {(task) => (
              <TaskListElement>
                <span>{task.title}</span>
                <RemoveTask
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
              ...tasks
                // avoid duplicates
                .filter((t) => !taskIds.includes(t.id))
                .map((t) => ({
                  value: t.id,
                  label: t.title,
                })),
            ]}
            data-testid="addTask"
            onChange={onAddTask}
            value={addTaskId}
          />

          <SubmitFormButton label={submitMessage} />
        </form>
      )}
    </SwrContent>
  );
};

export default SessionForm;