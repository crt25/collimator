import { useCallback } from "react";
import { useSWRConfig } from "swr";
import {
  getSolutionsControllerFindAllStudentSolutionsV0Url,
  getSolutionsControllerFindCurrentAnalysesV0Url,
} from "../../generated/endpoints/solutions/solutions";
import { SolutionsControllerFindCurrentAnalysesV0Params } from "../../generated/models";
import { allTasksPlaceholder } from "./useAllSessionSolutions";

const defaultParams: SolutionsControllerFindCurrentAnalysesV0Params = {};

export const useRevalidateSolutionList = (): ((
  classId: number,
  sessionId: number,
  taskId: number,
  params?: SolutionsControllerFindCurrentAnalysesV0Params,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (
      classId: number,
      sessionId: number,
      taskId: number,
      params?: SolutionsControllerFindCurrentAnalysesV0Params,
    ) => {
      mutate(
        getSolutionsControllerFindCurrentAnalysesV0Url(
          classId,
          sessionId,
          taskId,
          params ?? defaultParams,
        ),
      );

      mutate(
        getSolutionsControllerFindAllStudentSolutionsV0Url(
          classId,
          sessionId,
          taskId,
        ),
      );

      mutate(
        getSolutionsControllerFindAllStudentSolutionsV0Url(
          classId,
          sessionId,
          allTasksPlaceholder,
        ),
      );
    },
    [mutate],
  );
};
