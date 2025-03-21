import useSWR from "swr";
import { ApiResponse, getIdOrNaN } from "../helpers";
import {
  getTasksControllerFindOneWithReferenceSolutionsV0Url,
  tasksControllerFindOneWithReferenceSolutionsV0,
} from "../../generated/endpoints/tasks/tasks";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { ExistingTaskWithReferenceSolutions } from "../../models/tasks/existing-task-with-reference-solutions";

type GetTaskReturnType = ExistingTaskWithReferenceSolutions;

const fetchAndTransform = (
  options: RequestInit,
  id: number,
): Promise<GetTaskReturnType> =>
  tasksControllerFindOneWithReferenceSolutionsV0(id, options).then(
    ExistingTaskWithReferenceSolutions.fromDto,
  );

export const useTaskWithReferenceSolutions = (
  id?: number | string,
): ApiResponse<GetTaskReturnType, Error> => {
  const numericId = getIdOrNaN(id);
  const authOptions = useAuthenticationOptions();

  return useSWR(
    getTasksControllerFindOneWithReferenceSolutionsV0Url(numericId),
    () =>
      isNaN(numericId)
        ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
          new Promise<GetTaskReturnType>(() => {})
        : fetchAndTransform(authOptions, numericId),
  );
};
