import { useCallback } from "react";
import { ExistingTask } from "../../models/tasks/existing-task";
import { getTasksControllerCreateV0Url } from "../../generated/endpoints/tasks/tasks";
import { CreateTaskDto, ExistingTaskDto } from "../../generated/models";
import { fetchApi } from "@/api/fetch";
import { useRevalidateTask } from "./useRevalidateTask";
import { useRevalidateTaskList } from "./useRevalidateTaskList";

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
  const revalidateTask = useRevalidateTask();
  const revalidateTaskList = useRevalidateTaskList();

  return useCallback<CreateTaskType>(
    (taskMeta, task) =>
      createTask(taskMeta, task).then((result) => {
        revalidateTask(result.id, result);
        revalidateTaskList();

        return result;
      }),
    [revalidateTask, revalidateTaskList],
  );
};
