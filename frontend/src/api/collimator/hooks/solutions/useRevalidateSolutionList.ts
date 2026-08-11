import { useCallback } from "react";
import { useSWRConfig } from "swr";
import {
  getSolutionsControllerFindAllStudentSolutionsV0Url,
  getSolutionsControllerFindCurrentAnalysesV0Url,
} from "../../generated/endpoints/solutions/solutions";
import { allTasksPlaceholder } from "./useAllSessionSolutions";

export const useRevalidateSolutionList = (): ((
  classId: number,
  sessionId: number,
  taskId: number,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (classId: number, sessionId: number, taskId: number) => {
      // The current-analyses list is cached per query-param variant (the
      // analysis dashboard uses studentSolutionsOnly / ignoreStarredSolutions),
      // so revalidate every variant by key prefix rather than only the default.
      const matchesCurrentAnalyses =
        (baseTaskId: number) =>
        (key: unknown): boolean => {
          const base = getSolutionsControllerFindCurrentAnalysesV0Url(
            classId,
            sessionId,
            baseTaskId,
            {},
          );

          return typeof key === "string" && key.startsWith(base);
        };

      mutate(matchesCurrentAnalyses(taskId));
      mutate(matchesCurrentAnalyses(allTasksPlaceholder));

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
