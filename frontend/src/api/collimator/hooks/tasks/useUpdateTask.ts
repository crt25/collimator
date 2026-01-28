import { useCallback } from "react";
import { fetchApi } from "@/api/fetch";
import { getTasksControllerUpdateV0Url } from "../../generated/endpoints/tasks/tasks";
import {
  ExistingTaskDto,
  UpdateTaskDto,
  TasksControllerUpdateV0Params,
} from "../../generated/models";
import { ExistingTask } from "../../models/tasks/existing-task";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { useRevalidateTaskList } from "./useRevalidateTaskList";
import { useRevalidateTask } from "./useRevalidateTask";
import { useRevalidateTaskFile } from "./useRevalidateTaskFile";

const defaultParams: TasksControllerUpdateV0Params = {};

type UpdateTaskType = (
  id: number,
  updateTaskDto: UpdateTaskDto,
) => Promise<ExistingTask>;

const tasksControllerUpdate = async (
  id: number,
  updateTaskDto: UpdateTaskDto,
  params: TasksControllerUpdateV0Params = defaultParams,
  options?: RequestInit,
): Promise<ExistingTaskDto> => {
  const formData = new FormData();
  formData.append("title", updateTaskDto.title);
  formData.append("description", updateTaskDto.description);
  formData.append("type", updateTaskDto.type);
  formData.append("taskFile", updateTaskDto.taskFile);
  updateTaskDto.referenceSolutionsFiles.forEach((value) =>
    formData.append("referenceSolutionsFiles", value),
  );
  formData.append(
    "referenceSolutions",
    JSON.stringify(updateTaskDto.referenceSolutions),
  );

  return fetchApi<ExistingTaskDto>(getTasksControllerUpdateV0Url(id, params), {
    ...options,
    method: "PATCH",
    body: formData,
  });
};

const fetchAndTransform = (
  options: RequestInit,
  id: number,
  updateTaskDto: UpdateTaskDto,
  params: TasksControllerUpdateV0Params = defaultParams,
): ReturnType<UpdateTaskType> =>
  tasksControllerUpdate(id, updateTaskDto, params, options).then(
    ExistingTask.fromDto,
  );

export const useUpdateTask = (): UpdateTaskType => {
  const authOptions = useAuthenticationOptions();
  const revalidateTask = useRevalidateTask();
  const revalidateTaskFile = useRevalidateTaskFile();
  const revalidateTaskList = useRevalidateTaskList();

  return useCallback(
    (id, updateTaskDto) =>
      fetchAndTransform(authOptions, id, updateTaskDto).then((result) => {
        revalidateTaskFile(id, updateTaskDto.taskFile);
        revalidateTask(result.id, result);
        revalidateTaskList();

        return result;
      }),
    [authOptions, revalidateTask, revalidateTaskFile, revalidateTaskList],
  );
};
