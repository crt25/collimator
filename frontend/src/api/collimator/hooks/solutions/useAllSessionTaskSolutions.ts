import useSWR from "swr";
import {
  ApiResponse,
  fromDtos,
  getSwrParamererizedKey,
  transformToLazyTableResult,
} from "../helpers";
import { LazyTableResult, LazyTableState } from "@/components/DataTable";
import { ExistingSolution } from "../../models/solutions/existing-solution";
import {
  getSolutionsControllerFindAllV0Url,
  solutionsControllerFindAllV0,
} from "../../generated/endpoints/solutions/solutions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";

export type GetSolutionsReturnType = ExistingSolution[];

export const fetchSolutionsAndTransform = (
  options: RequestInit,
  classId: number,
  sessionId: number,
  taskId: number,
  _params?: undefined,
): Promise<GetSolutionsReturnType> =>
  solutionsControllerFindAllV0(classId, sessionId, taskId, options).then(
    (data) => fromDtos(ExistingSolution, data),
  );

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
        getSolutionsControllerFindAllV0Url(classId, sessionId, taskId),
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
        getSolutionsControllerFindAllV0Url(classId, sessionId, taskId),
      undefined,
    ),
    () =>
      fetchSolutionsAndTransform(authOptions, classId, sessionId, taskId).then(
        transformToLazyTableResult,
      ),
  );
};
