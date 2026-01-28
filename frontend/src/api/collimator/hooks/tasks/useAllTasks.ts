import useSWR from "swr";
import { ApiResponse, fromDtos } from "../helpers";
import {
  getTasksControllerFindAllV0Url,
  tasksControllerFindAllV0,
} from "../../generated/endpoints/tasks/tasks";
import { ExistingTask } from "../../models/tasks/existing-task";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { TasksControllerFindAllV0Params } from "../../generated/models";

export type GetTasksReturnType = ExistingTask[];

const defaultParams: TasksControllerFindAllV0Params = {};

const fetchAndTransform = (
  options: RequestInit,
  params: TasksControllerFindAllV0Params = defaultParams,
): Promise<GetTasksReturnType> =>
  tasksControllerFindAllV0(params, options).then((data) =>
    fromDtos(ExistingTask, data),
  );

export const useAllTasks = (
  params?: TasksControllerFindAllV0Params,
): ApiResponse<GetTasksReturnType, Error> => {
  const authOptions = useAuthenticationOptions();

  // use the URL with the params as the first entry in the key for easier invalidation
  return useSWR(getTasksControllerFindAllV0Url(params ?? defaultParams), () =>
    fetchAndTransform(authOptions, params),
  );
};
