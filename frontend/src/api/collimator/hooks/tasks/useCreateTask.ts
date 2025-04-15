import { useCallback } from "react";
import { fetchApi } from "@/api/fetch";
import { ExistingTask } from "../../models/tasks/existing-task";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { CreateTaskDto, ExistingTaskDto } from "../../generated/models";
import { getTasksControllerCreateV0Url } from "../../generated/endpoints/tasks/tasks";
import { useRevalidateTask } from "./useRevalidateTask";
import { useRevalidateTaskList } from "./useRevalidateTaskList";

type CreateTaskType = (createTaskDto: CreateTaskDto) => Promise<ExistingTask>;

export const tasksControllerCreate = async (
  createTaskDto: CreateTaskDto,
  options?: RequestInit,
): Promise<ExistingTaskDto> => {
  const formData = new FormData();
  formData.append("title", createTaskDto.title);
  formData.append("description", createTaskDto.description);
  formData.append("type", createTaskDto.type);
  formData.append("taskFile", createTaskDto.taskFile);
  formData.append(
    "referenceSolutions",
    JSON.stringify(createTaskDto.referenceSolutions),
  );
  createTaskDto.referenceSolutionsFiles.forEach((value) =>
    formData.append("referenceSolutionsFiles", value),
  );

  return fetchApi<ExistingTaskDto>(getTasksControllerCreateV0Url(), {
    ...options,
    method: "POST",
    body: formData,
  });
};

const createAndTransform = (
  options: RequestInit,
  createTaskDto: CreateTaskDto,
): ReturnType<CreateTaskType> =>
  tasksControllerCreate(createTaskDto, options).then(ExistingTask.fromDto);

export const useCreateTask = (): CreateTaskType => {
  const revalidateTask = useRevalidateTask();
  const revalidateTaskList = useRevalidateTaskList();
  const authOptions = useAuthenticationOptions();

  return useCallback<CreateTaskType>(
    (createTaskDto) =>
      createAndTransform(authOptions, createTaskDto).then((result) => {
        revalidateTask(result.id, result);
        revalidateTaskList();

        return result;
      }),
    [authOptions, revalidateTask, revalidateTaskList],
  );
};
