import { useCallback } from "react";
import {
  tasksControllerUpdateFileV0,
  tasksControllerUpdateV0,
} from "../../generated/endpoints/tasks/tasks";
import { ExistingTask } from "../../models/tasks/existing-task";
import { useRevalidateTaskList } from "./useRevalidateTaskList";
import { useRevalidateTask } from "./useRevalidateTask";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { UpdateTaskDto, UpdateTaskFileDto } from "../../generated/models";

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

type UpdateTaskFileType = (
  id: number,
  updateTaskFileDto: UpdateTaskFileDto,
) => Promise<ExistingTask>;

const fetchAndTransformFile = (
  options: RequestInit,
  id: number,
  updateTaskFileDto: UpdateTaskFileDto,
): ReturnType<UpdateTaskFileType> =>
  tasksControllerUpdateFileV0(id, updateTaskFileDto, options).then(
    ExistingTask.fromDto,
  );

export const useUpdateTaskFile = (): UpdateTaskFileType => {
  const authOptions = useAuthenticationOptions();

  return useCallback(
    (id, updateTaskFileDto) =>
      fetchAndTransformFile(authOptions, id, updateTaskFileDto),
    [authOptions],
  );
};
