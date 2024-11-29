import { useCallback } from "react";
import { DeletedTask } from "../../models/tasks/deleted-task";
import { tasksControllerRemoveV0 } from "../../generated/endpoints/tasks/tasks";
import { useRevalidateTaskList } from "./useRevalidateTaskList";

type Args = Parameters<typeof tasksControllerRemoveV0>;
type DeleteUserType = (...args: Args) => Promise<DeletedTask>;

const fetchAndTransform: DeleteUserType = (...args) =>
  tasksControllerRemoveV0(...args).then(DeletedTask.fromDto);

export const useDeleteTask = (): DeleteUserType => {
  const revalidateTaskList = useRevalidateTaskList();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        // Invalidate the cache for the task list
        revalidateTaskList();

        return result;
      }),
    [revalidateTaskList],
  );
};
