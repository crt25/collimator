import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { GetTaskReturnType } from "./useTask";
import { ExistingTask } from "../../models/tasks/existing-task";
import {
  getTasksControllerCreateV0Url,
  getTasksControllerFindOneV0Url,
} from "../../generated/endpoints/tasks/tasks";
import { CreateTaskDto, ExistingTaskDto } from "../../generated/models";
import { fetchApi } from "@/api/fetch";

type CreateTaskType = (
  taskMeta: CreateTaskDto,
  task: Blob,
) => Promise<ExistingTask>;

const createTask = (
  taskMeta: CreateTaskDto,
  task: Blob,
): Promise<ExistingTask> => {
  const formData = new FormData();

  formData.append("title", taskMeta.title);
  formData.append("description", taskMeta.description);
  formData.append("type", taskMeta.type);
  formData.append("file", task);

  return fetchApi<ExistingTaskDto>(getTasksControllerCreateV0Url(), {
    method: "POST",
    body: formData,
  }).then(ExistingTask.fromDto);
};

export const useCreateTask = (): CreateTaskType => {
  const { mutate } = useSWRConfig();

  return useCallback<CreateTaskType>(
    (taskMeta, task) =>
      createTask(taskMeta, task).then((result) => {
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
