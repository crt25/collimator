import useSWR from "swr";
import { ApiResponse, fromDtos } from "../helpers";
import {
  getTasksControllerFindAllV0Url,
  tasksControllerFindAllV0,
} from "../../generated/endpoints/tasks/tasks";
import { ExistingTask } from "../../models/tasks/existing-task";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { ExistingSessionExtended } from "../../models/sessions/existing-session-extended";
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

export const useTaskInstances = (
  session: ExistingSessionExtended,
  params: TasksControllerFindAllV0Params = defaultParams,
): ApiResponse<GetTasksReturnType, Error> => {
  const authOptions = useAuthenticationOptions();
  const sessionTaskIds = new Set(session.tasks.map((task) => task.id));

  // use the URL with the params as the first entry in the key for easier invalidation
  return useSWR(
    [getTasksControllerFindAllV0Url(params), "filteredBySessionId", session.id],
    () =>
      fetchAndTransform(authOptions, params).then((tasks) =>
        tasks.filter((t) => sessionTaskIds.has(t.id)),
      ),
  );
};
