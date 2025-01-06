import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { getTasksControllerDownloadOneV0Url } from "../../generated/endpoints/tasks/tasks";

export const useRevalidateTaskFile = (): ((
  taskId: number,
  newFile?: Blob,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (taskId: number, newFile?: Blob) => {
      mutate(getTasksControllerDownloadOneV0Url(taskId), newFile);
    },
    [mutate],
  );
};
