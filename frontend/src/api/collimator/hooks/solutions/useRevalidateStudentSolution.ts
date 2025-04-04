import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { getSolutionsControllerFindOneStudentSolutionV0Url } from "../../generated/endpoints/solutions/solutions";
import { GetSolutionReturnType } from "./useSolution";

export const useRevalidateStudentSolution = (): ((
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
        getSolutionsControllerFindOneStudentSolutionV0Url(
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
