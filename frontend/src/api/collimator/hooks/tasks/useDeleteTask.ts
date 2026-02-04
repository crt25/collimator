import { useCallback } from "react";
import { DeletedTask } from "../../models/tasks/deleted-task";
import { tasksControllerRemoveV0 } from "../../generated/endpoints/tasks/tasks";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { useRevalidateTaskList } from "./useRevalidateTaskList";

type DeleteTaskType = (id: number) => Promise<DeletedTask>;

const fetchAndTransform = (
  options: RequestInit,
  id: number,
): ReturnType<DeleteTaskType> =>
  tasksControllerRemoveV0(id, {}, options).then(DeletedTask.fromDto);

export const useDeleteTask = (): DeleteTaskType => {
  const revalidateTaskList = useRevalidateTaskList();
  const authOptions = useAuthenticationOptions();

  return useCallback<DeleteTaskType>(
    (id) =>
      fetchAndTransform(authOptions, id).then((result) => {
        // Invalidate the cache for the task list
        revalidateTaskList();

        return result;
      }),
    [authOptions, revalidateTaskList],
  );
};
