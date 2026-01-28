import { useCallback } from "react";
import { DeletedTask } from "../../models/tasks/deleted-task";
import { tasksControllerRemoveV0 } from "../../generated/endpoints/tasks/tasks";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { TasksControllerRemoveV0Params } from "../../generated/models";
import { useRevalidateTaskList } from "./useRevalidateTaskList";

type DeleteTaskType = (id: number) => Promise<DeletedTask>;

const defaultParams: TasksControllerRemoveV0Params = {};

const fetchAndTransform = (
  options: RequestInit,
  id: number,
  params: TasksControllerRemoveV0Params = defaultParams,
): ReturnType<DeleteTaskType> =>
  tasksControllerRemoveV0(id, params, options).then(DeletedTask.fromDto);

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
