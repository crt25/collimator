import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { GetTaskReturnType } from "./useTask";
import { getTasksControllerFindOneV0Url } from "../../generated/endpoints/tasks/tasks";

export const useRevalidateTask = (): ((
  taskId: number,
  newTask?: GetTaskReturnType,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (taskId: number, newTask?: GetTaskReturnType) => {
      mutate(getTasksControllerFindOneV0Url(taskId), newTask);
    },
    [mutate],
  );
};
