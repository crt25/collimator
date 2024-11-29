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

export type GetSolutionsReturnType = ExistingSolution[];

export const fetchSolutionsAndTransform = (
  classId: number,
  sessionId: number,
  taskId: number,
  _params?: undefined,
): Promise<GetSolutionsReturnType> =>
  solutionsControllerFindAllV0(classId, sessionId, taskId).then((data) =>
    fromDtos(ExistingSolution, data),
  );

export const useAllSessionTaskSolutions = (
  classId: number,
  sessionId: number,
  taskId: number,
  params?: undefined,
): ApiResponse<GetSolutionsReturnType, Error> =>
  useSWR(
    getSwrParamererizedKey(
      (_params?: undefined) =>
        getSolutionsControllerFindAllV0Url(classId, sessionId, taskId),
      undefined,
    ),
    () => fetchSolutionsAndTransform(classId, sessionId, taskId, params),
  );

export const useAllSessionTaskSolutionsLazyTable = (
  classId: number,
  sessionId: number,
  taskId: number,
  _state: LazyTableState,
): ApiResponse<LazyTableResult<GetSolutionsReturnType[0]>, Error> =>
  useSWR(
    getSwrParamererizedKey(
      (_params?: undefined) =>
        getSolutionsControllerFindAllV0Url(classId, sessionId, taskId),
      undefined,
    ),
    () =>
      fetchSolutionsAndTransform(classId, sessionId, taskId).then(
        transformToLazyTableResult,
      ),
  );
