import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { invalidateParameterizedKey } from "../helpers";
import { getTasksControllerFindAllV0Url } from "../../generated/endpoints/tasks/tasks";
import { TasksControllerFindAllV0Params } from "../../generated/models";

const defaultParams: TasksControllerFindAllV0Params = {};

export const useRevalidateTaskList = (): (() => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(() => {
    invalidateParameterizedKey(
      mutate,
      (params?: TasksControllerFindAllV0Params) =>
        getTasksControllerFindAllV0Url(params ?? defaultParams),
    );
  }, [mutate]);
};
