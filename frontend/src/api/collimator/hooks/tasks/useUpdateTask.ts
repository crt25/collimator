import { useCallback } from "react";
import {
  tasksControllerUpdateFileV0,
  tasksControllerUpdateV0,
} from "../../generated/endpoints/tasks/tasks";
import { ExistingTask } from "../../models/tasks/existing-task";
import { useRevalidateTaskList } from "./useRevalidateTaskList";
import { useRevalidateTask } from "./useRevalidateTask";

type Args = Parameters<typeof tasksControllerUpdateV0>;
type UpdateTaskType = (...args: Args) => Promise<ExistingTask>;

const fetchAndTransform: UpdateTaskType = (...args) =>
  tasksControllerUpdateV0(...args).then(ExistingTask.fromDto);

export const useUpdateTask = (): UpdateTaskType => {
  const revalidateTask = useRevalidateTask();
  const revalidateTaskList = useRevalidateTaskList();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        revalidateTask(result.id, result);
        revalidateTaskList();

        return result;
      }),
    [revalidateTask, revalidateTaskList],
  );
};

type FileArgs = Parameters<typeof tasksControllerUpdateFileV0>;
type UpdateTaskFileType = (...args: FileArgs) => Promise<ExistingTask>;

const fetchAndTransformFile: UpdateTaskFileType = (...args) =>
  tasksControllerUpdateFileV0(...args).then(ExistingTask.fromDto);

export const useUpdateTaskFile = (): UpdateTaskFileType =>
  useCallback((...args: FileArgs) => fetchAndTransformFile(...args), []);
