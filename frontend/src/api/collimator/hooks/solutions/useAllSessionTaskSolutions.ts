import useSWR from "swr";
import { ApiResponse, fromDtos, getIdOrNaN } from "../helpers";
import {
  getSolutionsControllerFindAllStudentSolutionsV0Url,
  solutionsControllerFindAllStudentSolutionsV0,
} from "../../generated/endpoints/solutions/solutions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { ExistingStudentSolution } from "../../models/solutions/existing-student-solutions";

export type GetSolutionsReturnType = ExistingStudentSolution[];

export const fetchSolutionsAndTransform = (
  options: RequestInit,
  classId: number,
  sessionId: number,
  taskId: number,
  _params?: undefined,
): Promise<GetSolutionsReturnType> =>
  solutionsControllerFindAllStudentSolutionsV0(
    classId,
    sessionId,
    taskId,
    options,
  ).then((data) => fromDtos(ExistingStudentSolution, data));

export const useAllSessionTaskSolutions = (
  classId?: number | string,
  sessionId?: number | string,
  taskId?: number | string,
  params?: undefined,
): ApiResponse<GetSolutionsReturnType, Error> => {
  const numericClassId = getIdOrNaN(classId);
  const numericSessionId = getIdOrNaN(sessionId);
  const numericTaskId = getIdOrNaN(taskId);

  const authOptions = useAuthenticationOptions();

  return useSWR(
    getSolutionsControllerFindAllStudentSolutionsV0Url(
      numericClassId,
      numericSessionId,
      numericTaskId,
    ),
    () =>
      isNaN(numericClassId) || isNaN(numericSessionId) || isNaN(numericTaskId)
        ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
          new Promise<GetSolutionsReturnType>(() => {})
        : fetchSolutionsAndTransform(
            authOptions,
            numericClassId,
            numericSessionId,
            numericTaskId,
            params,
          ),
  );
};
