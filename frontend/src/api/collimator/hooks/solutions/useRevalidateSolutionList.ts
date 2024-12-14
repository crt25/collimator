import { useCallback } from "react";
import { useSWRConfig } from "swr";
import {
  getSolutionsControllerFindAllV0Url,
  getSolutionsControllerFindCurrentAnalysisV0Url,
} from "@/api/collimator/generated/endpoints/solutions/solutions";

export const useRevalidateSolutionList = (): ((
  classId: number,
  sessionId: number,
  taskId: number,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (classId: number, sessionId: number, taskId: number) => {
      mutate(
        getSolutionsControllerFindCurrentAnalysisV0Url(
          classId,
          sessionId,
          taskId,
        ),
      );

      mutate(getSolutionsControllerFindAllV0Url(classId, sessionId, -1));
    },
    [mutate],
  );
};
