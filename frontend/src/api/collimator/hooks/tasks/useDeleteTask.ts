import { useCallback } from "react";
import { DeletedTask } from "../../models/tasks/deleted-task";
import { tasksControllerRemoveV0 } from "../../generated/endpoints/tasks/tasks";
import { useRevalidateTaskList } from "./useRevalidateTaskList";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";

type DeleteUserType = (id: number) => Promise<DeletedTask>;

const fetchAndTransform = (
  options: RequestInit,
  id: number,
): ReturnType<DeleteUserType> =>
  tasksControllerRemoveV0(id, options).then(DeletedTask.fromDto);

export const useDeleteTask = (): DeleteUserType => {
  const revalidateTaskList = useRevalidateTaskList();
  const authOptions = useAuthenticationOptions();

  return useCallback<DeleteUserType>(
    (id) =>
      fetchAndTransform(authOptions, id).then((result) => {
        // Invalidate the cache for the task list
        revalidateTaskList();

        return result;
      }),
    [authOptions, revalidateTaskList],
  );
};
