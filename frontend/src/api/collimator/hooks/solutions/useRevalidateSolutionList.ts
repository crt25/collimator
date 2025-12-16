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
      mutate(
        getSolutionsControllerFindCurrentAnalysesV0Url(
          classId,
          sessionId,
          taskId,
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
