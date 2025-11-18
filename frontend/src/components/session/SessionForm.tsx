import { useForm, Controller, UseFormReset } from "react-hook-form";
import * as yup from "yup";
import { defineMessages, MessageDescriptor } from "react-intl";
import {
  Portal,
  Select,
  createListCollection,
  chakra,
  Field,
  Flex,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import Input from "../form/Input";
import FormContainer from "../form/FormContainer";
import { EditedBadge } from "../EditedBadge";
import FormGrid from "../form/FormGrid";
import SubmitFormButton from "../form/SubmitFormButton";

const ButtonWrapper = chakra("div", {
  base: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "4xl",
  },
});

const messages = defineMessages({
  title: {
    id: "SessionForm.title",
    defaultMessage: "Title",
  },
  sharingType: {
    id: "SessionForm.sharingType",
    defaultMessage: "Sharing Type",
  },
  placeholderSelectSharingType: {
    id: "SessionForm.placeholder.selectSharingType",
    defaultMessage: "Select Sharing Type",
  },
  titleRequired: {
    id: "SessionForm.error.titleRequired",
    defaultMessage: "Title is required",
  },
  sharingTypeRequired: {
    id: "SessionForm.error.sharingTypeRequired",
    defaultMessage: "Sharing Type is required",
  },
  sharingTypeAnonymous: {
    id: "SessionForm.sharingType.anonymous",
    defaultMessage: "Anonymous",
  },
  sharingTypePublic: {
    id: "SessionForm.sharingType.public",
    defaultMessage: "Public",
  },
  disabledSaveButtonTooltip: {
    id: "SessionForm.tooltip.disabledSaveButton",
    defaultMessage: "No changes to save",
  },
});

export type SessionFormValues = {
  title: string;
  sharingType: string;
  description: string;
  taskIds: number[];
};

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
    title: yup.string().required(messages.titleRequired.defaultMessage),
    sharingType: yup
      .string()
      .required(messages.sharingTypeRequired.defaultMessage),
    description: yup.string().default(""),
    taskIds: yup.array().of(yup.number().required()).default([]),
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
