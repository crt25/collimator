import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { getTasksControllerDownloadOneV0Url } from "../../generated/endpoints/tasks/tasks";
import { TasksControllerDownloadOneV0Params } from "../../generated/models";

const defaultParams: TasksControllerDownloadOneV0Params = {};

export const useRevalidateTaskFile = (): ((
  taskId: number,
  newFile?: Blob,
  params?: TasksControllerDownloadOneV0Params,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (
      taskId: number,
      newFile?: Blob,
      params: TasksControllerDownloadOneV0Params = defaultParams,
    ) => {
      mutate(getTasksControllerDownloadOneV0Url(taskId, params), newFile);
    },
    [mutate],
  );
};
