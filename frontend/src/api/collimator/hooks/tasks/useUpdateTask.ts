import { useCallback } from "react";
import { fetchApi } from "@/api/fetch";
import { getTasksControllerUpdateV0Url } from "../../generated/endpoints/tasks/tasks";
import { ExistingTaskDto, UpdateTaskDto } from "../../generated/models";
import { ExistingTask } from "../../models/tasks/existing-task";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { useRevalidateTaskList } from "./useRevalidateTaskList";
import { useRevalidateTask } from "./useRevalidateTask";
import { useRevalidateTaskFile } from "./useRevalidateTaskFile";

type UpdateTaskType = (
  id: number,
  updateTaskDto: UpdateTaskDto,
) => Promise<ExistingTask>;

const tasksControllerUpdate = async (
  id: number,
  updateTaskDto: UpdateTaskDto,
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
  formData.append("isPublic", JSON.stringify(updateTaskDto.isPublic));

  return fetchApi<ExistingTaskDto>(getTasksControllerUpdateV0Url(id), {
    ...options,
    method: "PATCH",
    body: formData,
  });
};

const fetchAndTransform = (
  options: RequestInit,
  id: number,
  updateTaskDto: UpdateTaskDto,
): ReturnType<UpdateTaskType> =>
  tasksControllerUpdate(id, updateTaskDto, options).then(ExistingTask.fromDto);

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
