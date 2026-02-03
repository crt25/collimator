import { useSWRConfig } from "swr";
import { useCallback } from "react";
import {
  getTasksControllerFindOneV0Url,
  getTasksControllerFindOneWithReferenceSolutionsV0Url,
} from "../../generated/endpoints/tasks/tasks";
import { TasksControllerFindOneV0Params } from "../../generated/models";
import { GetTaskReturnType } from "./useTask";

const defaultParams: TasksControllerFindOneV0Params = {};

export const useRevalidateTask = (): ((
  taskId: number,
  newTask?: GetTaskReturnType,
  params?: TasksControllerFindOneV0Params,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (
      taskId: number,
      newTask?: GetTaskReturnType,
      params: TasksControllerFindOneV0Params = defaultParams,
    ) => {
      mutate(getTasksControllerFindOneV0Url(taskId, params), newTask);
      mutate(
        getTasksControllerFindOneWithReferenceSolutionsV0Url(taskId, params),
      );
    },
    [mutate],
  );
};
