import useSWR from "swr";
import { ApiResponse, fromDtos } from "../helpers";
import {
  getTasksControllerFindAllV0Url,
  tasksControllerFindAllV0,
} from "../../generated/endpoints/tasks/tasks";
import { ExistingTask } from "../../models/tasks/existing-task";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";

export type GetTasksReturnType = ExistingTask[];

const fetchAndTransform = (options: RequestInit): Promise<GetTasksReturnType> =>
  tasksControllerFindAllV0({}, options).then((data) =>
    fromDtos(ExistingTask, data),
  );

export const useAllTasks = (): ApiResponse<GetTasksReturnType, Error> => {
  const authOptions = useAuthenticationOptions();
  return useSWR(
    // use the URL with the params as the first entry in the key for easier invalidation
    getTasksControllerFindAllV0Url,
    () => fetchAndTransform(authOptions),
  );
};
