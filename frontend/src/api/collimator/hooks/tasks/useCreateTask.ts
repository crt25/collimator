import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { GetTaskReturnType } from "./useTask";
import { ExistingTask } from "../../models/tasks/existing-task";
import { getTasksControllerFindOneV0Url, tasksControllerCreateV0 } from "../../generated/endpoints/tasks/tasks";

type Args = Parameters<typeof tasksControllerCreateV0>;
type CreateTaskType = (...args: Args) => Promise<ExistingTask>;

const createAndTransform: CreateTaskType = (...args) =>
  tasksControllerCreateV0(...args).then(ExistingTask.fromDto);

export const useCreateTask = (): CreateTaskType => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      createAndTransform(...args).then((result) => {
        // store the created task in the cache
        const getTasksControllerFindOneResponse: GetTaskReturnType = result;

        mutate(
          getTasksControllerFindOneV0Url(result.id),
          getTasksControllerFindOneResponse,
        );

        return result;
      }),
    [mutate],
  );
};
