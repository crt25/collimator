import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { getSolutionsControllerFindAllStudentSolutionsV0Url } from "../../generated/endpoints/solutions/solutions";
import { allTasksPlaceholder } from "./useAllSessionSolutions";
import { matchesCurrentAnalysesKey } from "./currentAnalysesKey";

export const useRevalidateSolutionList = (): ((
  classId: number,
  sessionId: number,
  taskId: number,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (classId: number, sessionId: number, taskId: number) => {
      // The current-analyses list is cached per query-param variant, so
      // revalidate every variant by key prefix rather than only the default.
      mutate(matchesCurrentAnalysesKey(classId, sessionId, taskId));
      mutate(
        matchesCurrentAnalysesKey(classId, sessionId, allTasksPlaceholder),
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
