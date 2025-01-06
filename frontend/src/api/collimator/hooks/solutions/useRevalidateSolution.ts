import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { getSolutionsControllerFindOneV0Url } from "../../generated/endpoints/solutions/solutions";
import { GetSolutionReturnType } from "./useSolution";

export const useRevalidateSolution = (): ((
  classId: number,
  sessionId: number,
  taskId: number,
  solutionId: number,
  newSolution?: GetSolutionReturnType,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (
      classId: number,
      sessionId: number,
      taskId: number,
      solutionId: number,
      newSolution?: GetSolutionReturnType,
    ) => {
      mutate(
        getSolutionsControllerFindOneV0Url(
          classId,
          sessionId,
          taskId,
          solutionId,
        ),
        newSolution,
      );
    },
    [mutate],
  );
};
