import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { GetTaskReturnType } from "./useTask";
import { getTasksControllerFindOneV0Url, tasksControllerUpdateV0 } from "../../generated/endpoints/tasks/tasks";
import { ExistingTask } from "../../models/tasks/existing-task";

type Args = Parameters<typeof tasksControllerUpdateV0>;
type UpdateUserType = (...args: Args) => Promise<ExistingTask>;

const fetchAndTransform: UpdateUserType = (...args) =>
  tasksControllerUpdateV0(...args).then(ExistingTask.fromDto);

export const useUpdateTask = (): UpdateUserType => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
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
