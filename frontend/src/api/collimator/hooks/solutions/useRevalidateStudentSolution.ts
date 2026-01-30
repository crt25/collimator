import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { getSolutionsControllerFindOneStudentSolutionV0Url } from "../../generated/endpoints/solutions/solutions";
import { SolutionsControllerFindOneStudentSolutionV0Params } from "../../generated/models";
import { GetSolutionReturnType } from "./useSolution";

const defaultParams: SolutionsControllerFindOneStudentSolutionV0Params = {};

export const useRevalidateStudentSolution = (): ((
  classId: number,
  sessionId: number,
  taskId: number,
  solutionId: number,
  newSolution?: GetSolutionReturnType,
  params?: SolutionsControllerFindOneStudentSolutionV0Params,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (
      classId: number,
      sessionId: number,
      taskId: number,
      solutionId: number,
      newSolution?: GetSolutionReturnType,
      params: SolutionsControllerFindOneStudentSolutionV0Params = defaultParams,
    ) => {
      mutate(
        getSolutionsControllerFindOneStudentSolutionV0Url(
          classId,
          sessionId,
          taskId,
          solutionId,
          params ?? defaultParams,
        ),
        newSolution,
      );
    },
    [mutate],
  );
};
