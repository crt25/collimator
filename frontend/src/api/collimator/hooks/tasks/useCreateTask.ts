import { useCallback } from "react";
import { ExistingTask } from "../../models/tasks/existing-task";
import { tasksControllerCreateV0 } from "../../generated/endpoints/tasks/tasks";
import { useRevalidateTask } from "./useRevalidateTask";
import { useRevalidateTaskList } from "./useRevalidateTaskList";

type Args = Parameters<typeof tasksControllerCreateV0>;
type CreateTaskType = (...args: Args) => Promise<ExistingTask>;

const createAndTransform: CreateTaskType = (...args) =>
  tasksControllerCreateV0(...args).then(ExistingTask.fromDto);

export const useCreateTask = (): CreateTaskType => {
  const revalidateTask = useRevalidateTask();
  const revalidateTaskList = useRevalidateTaskList();

  return useCallback<CreateTaskType>(
    (...args: Args) =>
      createAndTransform(...args).then((result) => {
        revalidateTask(result.id, result);
        revalidateTaskList();

        return result;
      }),
    [revalidateTask, revalidateTaskList],
  );
};
