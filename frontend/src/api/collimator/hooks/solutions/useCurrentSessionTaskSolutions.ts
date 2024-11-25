import useSWR from "swr";
import { ApiResponse, fromDtos, getSwrParamererizedKey } from "../helpers";
import {
  getSolutionsControllerFindCurrentAnalysisV0Url,
  solutionsControllerFindCurrentAnalysisV0,
} from "../../generated/endpoints/solutions/solutions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { CurrentAnalysis } from "../../models/solutions/current-analysis";

export type GetCurrentAnalysisReturnType = CurrentAnalysis[];

export const fetchSolutionsAndTransform = (
  options: RequestInit,
  classId: number,
  sessionId: number,
  taskId: number,
  _params?: undefined,
): Promise<GetCurrentAnalysisReturnType> =>
  solutionsControllerFindCurrentAnalysisV0(
    classId,
    sessionId,
    taskId,
    options,
  ).then((data) => fromDtos(CurrentAnalysis, data));

export const useCurrentSessionTaskSolutions = (
  classId: number,
  sessionId: number,
  taskId: number,
  params?: undefined,
): ApiResponse<GetCurrentAnalysisReturnType, Error> => {
  const authOptions = useAuthenticationOptions();

  return useSWR(
    getSwrParamererizedKey(
      (_params?: undefined) =>
        getSolutionsControllerFindCurrentAnalysisV0Url(
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
