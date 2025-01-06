import { useCallback } from "react";
import { solutionsControllerDeleteOneV0 } from "../../generated/endpoints/solutions/solutions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { useRevalidateSolutionList } from "./useRevalidateSolutionList";

type DeleteSolutionType = (
  classId: number,
  sessionId: number,
  taskId: number,
  solutionId: number,
) => Promise<void>;

const fetchAndTransform = (
  options: RequestInit,
  classId: number,
  sessionId: number,
  taskId: number,
  solutionId: number,
): ReturnType<DeleteSolutionType> =>
  solutionsControllerDeleteOneV0(
    classId,
    sessionId,
    taskId,
    solutionId,
    options,
  );

export const useDeleteSolution = (): DeleteSolutionType => {
  const revalidateSolutionList = useRevalidateSolutionList();
  const authOptions = useAuthenticationOptions();

  return useCallback(
    (classId, sessionId, taskId, solutionId) =>
      fetchAndTransform(
        authOptions,
        classId,
        sessionId,
        taskId,
        solutionId,
      ).then((result) => {
        // Invalidate the cache for the solution list
        revalidateSolutionList(classId, sessionId, taskId);

        return result;
      }),
    [authOptions, revalidateSolutionList],
  );
};
