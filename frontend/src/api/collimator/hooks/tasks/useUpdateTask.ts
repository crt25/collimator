import { useCallback } from "react";
import {
  tasksControllerUpdateFileV0,
  tasksControllerUpdateV0,
} from "../../generated/endpoints/tasks/tasks";
import { ExistingTask } from "../../models/tasks/existing-task";
import { useRevalidateTaskList } from "./useRevalidateTaskList";
import { useRevalidateTask } from "./useRevalidateTask";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { UpdateTaskDto } from "../../generated/models";

type UpdateTaskType = (
  id: number,
  updateTaskDto: UpdateTaskDto,
) => Promise<ExistingTask>;

const fetchAndTransform = (
  options: RequestInit,
  id: number,
  updateTaskDto: UpdateTaskDto,
): ReturnType<UpdateTaskType> =>
  tasksControllerUpdateV0(id, updateTaskDto, options).then(
    ExistingTask.fromDto,
  );

export const useUpdateTask = (): UpdateTaskType => {
  const authOptions = useAuthenticationOptions();
  const revalidateTask = useRevalidateTask();
  const revalidateTaskList = useRevalidateTaskList();

  return useCallback(
    (id, updateTaskDto) =>
      fetchAndTransform(authOptions, id, updateTaskDto).then((result) => {
        revalidateTask(result.id, result);
        revalidateTaskList();

        return result;
      }),
    [authOptions, revalidateTask, revalidateTaskList],
  );
};

type FileArgs = Parameters<typeof tasksControllerUpdateFileV0>;
type UpdateTaskFileType = (...args: FileArgs) => Promise<ExistingTask>;

const fetchAndTransformFile: UpdateTaskFileType = (...args) =>
  tasksControllerUpdateFileV0(...args).then(ExistingTask.fromDto);

export const useUpdateTaskFile = (): UpdateTaskFileType =>
  useCallback((...args: FileArgs) => fetchAndTransformFile(...args), []);
