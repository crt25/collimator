import { useSWRConfig } from "swr";
import { invalidateParameterizedKey } from "../helpers";
import { useCallback } from "react";
import { getTasksControllerFindAllV0Url } from "../../generated/endpoints/tasks/tasks";

export const useRevalidateTaskList = (): (() => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(() => {
    invalidateParameterizedKey(mutate, getTasksControllerFindAllV0Url);
  }, [mutate]);
};
