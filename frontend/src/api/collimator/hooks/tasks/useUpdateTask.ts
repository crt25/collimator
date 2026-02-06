import { useCallback } from "react";
import { fetchApi } from "@/api/fetch";
import {
  UpdateReferenceSolutionDto,
  ExistingTaskDto,
  UpdateTaskDto,
} from "@/api/collimator/generated/models";
import { TaskFormSubmission } from "@/components/task/TaskForm";
import { getTasksControllerUpdateV0Url } from "../../generated/endpoints/tasks/tasks";

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

type ReferenceSolutionResult = [UpdateReferenceSolutionDto[], Blob[]];
type ExistingSolutions = Array<UpdateReferenceSolutionDto & { solution: Blob }>;

export const getInitialSolutionOnly = (
  taskSubmission: TaskFormSubmission,
): ReferenceSolutionResult => {
  const { initialSolution, initialSolutionFile } = taskSubmission;

  if (initialSolution && initialSolutionFile) {
    return [[initialSolution], [initialSolutionFile]];
  }

  return [[], []];
};

export const appendOrUpdateInitialSolution = (
  taskSubmission: TaskFormSubmission,
  existingSolutions: ExistingSolutions,
): ReferenceSolutionResult => {
  const { initialSolution, initialSolutionFile } = taskSubmission;

  if (initialSolution && initialSolutionFile) {
    const nonInitialSolutions = existingSolutions.filter((s) => !s.isInitial);

    return [
      [...nonInitialSolutions, initialSolution],
      [...nonInitialSolutions.map((s) => s.solution), initialSolutionFile],
    ];
  }

  return [[...existingSolutions], existingSolutions.map((s) => s.solution)];
};
