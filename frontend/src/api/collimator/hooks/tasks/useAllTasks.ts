import useSWR from "swr";
import { useContext, useMemo } from "react";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { UserRole } from "@/types/user/user-role";
import { ApiResponse, fromDtos, getSwrParametrizedKey } from "../helpers";
import {
  getTasksControllerFindAllV0Url,
  tasksControllerFindAllV0,
} from "../../generated/endpoints/tasks/tasks";
import { ExistingTask } from "../../models/tasks/existing-task";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { TasksControllerFindAllV0Params } from "../../generated/models";

export type GetTasksReturnType = ExistingTask[];

const fetchAndTransform = (
  options: RequestInit,
  params?: TasksControllerFindAllV0Params,
): Promise<GetTasksReturnType> =>
  tasksControllerFindAllV0(params, options).then((data) =>
    fromDtos(ExistingTask, data),
  );

export const useAllTasks = (
  params?: TasksControllerFindAllV0Params,
): ApiResponse<GetTasksReturnType, Error> => {
  const authenticationContext = useContext(AuthenticationContext);
  const authOptions = useAuthenticationOptions();

  const parameters = useMemo<TasksControllerFindAllV0Params>(() => {
    const parameters: TasksControllerFindAllV0Params = { ...params };

    // if the user is a teacher, only fetch tasks for that teacher
    if (authenticationContext.role === UserRole.teacher) {
      parameters.teacherId = authenticationContext.userId;
    }

    return parameters;
  }, [params, authenticationContext]);

  // use the URL with the params as the first entry in the key for easier invalidation
  return useSWR(
    // use the URL with the params as the first entry in the key for easier invalidation
    getSwrParametrizedKey(getTasksControllerFindAllV0Url, parameters),
    () => fetchAndTransform(authOptions, parameters),
  );
};
