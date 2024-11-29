import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { GetSolutionReturnType } from "./useSolution";
import { getSolutionsControllerFindOneV0Url } from "../../generated/endpoints/solutions/solutions";

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
