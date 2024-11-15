import { useCallback } from "react";
import { ExistingTask } from "../../models/tasks/existing-task";
import { tasksControllerCreateV0 } from "../../generated/endpoints/tasks/tasks";
import { useRevalidateTask } from "./useRevalidateTask";
import { useRevalidateTaskList } from "./useRevalidateTaskList";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { CreateTaskDto } from "../../generated/models";

type CreateTaskType = (createTaskDto: CreateTaskDto) => Promise<ExistingTask>;

const createAndTransform = (
  options: RequestInit,
  createTaskDto: CreateTaskDto,
): ReturnType<CreateTaskType> =>
  tasksControllerCreateV0(createTaskDto, options).then(ExistingTask.fromDto);

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
