import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { GetTaskReturnType } from "./useTask";
import {
  getTasksControllerFindOneV0Url,
  getTasksControllerUpdateFileV0Url,
  tasksControllerUpdateV0,
} from "../../generated/endpoints/tasks/tasks";
import { ExistingTask } from "../../models/tasks/existing-task";
import { fetchApi } from "@/api/fetch";
import { ExistingTaskDto } from "../../generated/models";

type Args = Parameters<typeof tasksControllerUpdateV0>;
type UpdateUserType = (...args: Args) => Promise<ExistingTask>;

const fetchAndTransform: UpdateUserType = (...args) =>
  tasksControllerUpdateV0(...args).then(ExistingTask.fromDto);

export const useUpdateTask = (): UpdateUserType => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        // store the created task in the cache
        const getTasksControllerFindOneResponse: GetTaskReturnType = result;

        mutate(
          getTasksControllerFindOneV0Url(result.id),
          getTasksControllerFindOneResponse,
        );

        return result;
      }),
    [mutate],
  );
};

const updateTaskFile = (taskId: number, task: Blob): Promise<ExistingTask> => {
  const formData = new FormData();

  formData.append("file", task);

  return fetchApi<ExistingTaskDto>(getTasksControllerUpdateFileV0Url(taskId), {
    method: "PATCH",
    body: formData,
  }).then(ExistingTask.fromDto);
};

export const useUpdateTaskFile = (): typeof updateTaskFile =>
  useCallback<typeof updateTaskFile>(
    (taskId, task) => updateTaskFile(taskId, task),
    [],
  );
