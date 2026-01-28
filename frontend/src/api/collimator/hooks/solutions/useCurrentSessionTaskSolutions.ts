import useSWR from "swr";
import { ApiResponse, fromDtos } from "../helpers";
import {
  getSolutionsControllerFindCurrentAnalysesV0Url,
  solutionsControllerFindCurrentAnalysesV0,
} from "../../generated/endpoints/solutions/solutions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { CurrentAnalysis } from "../../models/solutions/current-analysis";
import { CurrentStudentAnalysis } from "../../models/solutions/current-student-analysis";
import { ReferenceAnalysis } from "../../models/solutions/reference-analysis";
import { SolutionsControllerFindCurrentAnalysesV0Params } from "../../generated/models";

export type GetCurrentAnalysisReturnType = CurrentAnalysis[];

const defaultParams: SolutionsControllerFindCurrentAnalysesV0Params = {};

export const fetchSolutionsAndTransform = (
  options: RequestInit,
  classId: number,
  sessionId: number,
  taskId?: number,
  params: SolutionsControllerFindCurrentAnalysesV0Params = defaultParams,
): Promise<GetCurrentAnalysisReturnType> =>
  taskId
    ? solutionsControllerFindCurrentAnalysesV0(
        classId,
        sessionId,
        taskId,
        params,
        options,
      ).then((data) => {
        const studentAnalyses: CurrentStudentAnalysis[] = fromDtos(
          CurrentStudentAnalysis,
          data.studentAnalyses,
        );

        const referenceAnalyses: ReferenceAnalysis[] = fromDtos(
          ReferenceAnalysis,
          data.referenceAnalyses,
        );

        return [...studentAnalyses, ...referenceAnalyses];
      })
    : Promise.resolve([]);

export const useCurrentSessionTaskSolutions = (
  classId: number,
  sessionId: number,
  taskId?: number,
  params: SolutionsControllerFindCurrentAnalysesV0Params = defaultParams,
): ApiResponse<GetCurrentAnalysisReturnType, Error> => {
  const authOptions = useAuthenticationOptions();

  return useSWR(
    taskId
      ? getSolutionsControllerFindCurrentAnalysesV0Url(
          classId,
          sessionId,
          taskId,
          params,
        )
      : null,
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
