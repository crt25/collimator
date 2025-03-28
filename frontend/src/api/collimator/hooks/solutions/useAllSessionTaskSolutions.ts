import useSWR from "swr";
import { LazyTableResult, LazyTableState } from "@/components/DataTable";
import {
  ApiResponse,
  fromDtos,
  getSwrParamererizedKey,
  transformToLazyTableResult,
} from "../helpers";
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
  classId: number,
  sessionId: number,
  taskId: number,
  params?: undefined,
): ApiResponse<GetSolutionsReturnType, Error> => {
  const authOptions = useAuthenticationOptions();

  return useSWR(
    getSwrParamererizedKey(
      (_params?: undefined) =>
        getSolutionsControllerFindAllStudentSolutionsV0Url(
          classId,
          sessionId,
          taskId,
        ),
      undefined,
    ),
    () =>
      fetchSolutionsAndTransform(
        authOptions,
        classId,
        sessionId,
        taskId,
        params,
      ),
  );
};

export const useAllSessionTaskSolutionsLazyTable = (
  classId: number,
  sessionId: number,
  taskId: number,
  _state: LazyTableState,
): ApiResponse<LazyTableResult<GetSolutionsReturnType[0]>, Error> => {
  const authOptions = useAuthenticationOptions();

  return useSWR(
    getSwrParamererizedKey(
      (_params?: undefined) =>
        getSolutionsControllerFindAllStudentSolutionsV0Url(
          classId,
          sessionId,
          taskId,
        ),
      undefined,
    ),
    () =>
      fetchSolutionsAndTransform(authOptions, classId, sessionId, taskId).then(
        transformToLazyTableResult,
      ),
  );
};
