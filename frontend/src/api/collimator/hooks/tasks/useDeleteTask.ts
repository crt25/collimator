import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { DeletedTask } from "../../models/tasks/deleted-task";
import { getTasksControllerFindAllV0Url, tasksControllerRemoveV0 } from "../../generated/endpoints/tasks/tasks";

type Args = Parameters<typeof tasksControllerRemoveV0>;
type DeleteUserType = (...args: Args) => Promise<DeletedTask>;

const fetchAndTransform: DeleteUserType = (...args) =>
  tasksControllerRemoveV0(...args).then(DeletedTask.fromDto);

export const useDeleteTask = (): DeleteUserType => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        // Invalidate the cache for the task list
        mutate((key) => {
          return (
            Array.isArray(key) &&
            key.length >= 1 &&
            typeof key[0] === "string" &&
            key[0].startsWith(getTasksControllerFindAllV0Url())
          );
        });

        return result;
      }),
    [mutate],
  );
};
