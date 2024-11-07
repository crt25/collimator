import useSWR from "swr";
import { ApiResponse } from "../helpers";
import { ExistingTask } from "../../models/tasks/existing-task";
import { getTasksControllerFindOneV0Url, tasksControllerFindOneV0 } from "../../generated/endpoints/tasks/tasks";

export type GetTaskReturnType = ExistingTask;

const fetchAndTransform = (id: number): Promise<GetTaskReturnType> =>
  tasksControllerFindOneV0(id).then(ExistingTask.fromDto);

export const useTask = (
  id: number | string,
): ApiResponse<GetTaskReturnType, Error> => {
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;

  return useSWR(getTasksControllerFindOneV0Url(numericId), () =>
    isNaN(numericId)
      ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
        new Promise<GetTaskReturnType>(() => {})
      : fetchAndTransform(numericId),
  );
};
