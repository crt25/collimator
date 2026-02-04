import { useSWRConfig } from "swr";
import { useCallback } from "react";
import {
  getTasksControllerFindOneV0Url,
  getTasksControllerFindOneWithReferenceSolutionsV0Url,
} from "../../generated/endpoints/tasks/tasks";
import { GetTaskReturnType } from "./useTask";

export const useRevalidateTask = (): ((
  taskId: number,
  newTask?: GetTaskReturnType,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (taskId: number, newTask?: GetTaskReturnType) => {
      mutate(getTasksControllerFindOneV0Url(taskId, {}), newTask);
      mutate(getTasksControllerFindOneWithReferenceSolutionsV0Url(taskId, {}));
    },
    [mutate],
  );
};
