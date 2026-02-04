import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { invalidateParameterizedKey } from "../helpers";
import { getTasksControllerFindAllV0Url } from "../../generated/endpoints/tasks/tasks";

export const useRevalidateTaskList = (): (() => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(() => {
    invalidateParameterizedKey(mutate, () =>
      getTasksControllerFindAllV0Url({}),
    );
  }, [mutate]);
};
