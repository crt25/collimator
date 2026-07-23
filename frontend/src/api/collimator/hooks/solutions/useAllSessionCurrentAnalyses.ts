import useSWR from "swr";
import { AutoRefreshingConfig } from "@/utilities/live-refresh";
import { ApiResponse } from "../helpers";
import { getSolutionsControllerFindCurrentAnalysesV0Url } from "../../generated/endpoints/solutions/solutions";
import { useClassSession } from "../sessions/useClassSession";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import {
  fetchSolutionsAndTransform,
  GetCurrentAnalysisReturnType,
} from "./useCurrentSessionTaskSolutions";
import { allTasksPlaceholder } from "./useAllSessionSolutions";

type SessionAnalyses = {
  taskId: number;
  analyses: GetCurrentAnalysisReturnType;
};

export const useAllSessionCurrentAnalyses = (
  classId: number,
  sessionId: number,
  refreshConfig?: AutoRefreshingConfig,
): ApiResponse<SessionAnalyses[], Error> => {
  const authOptions = useAuthenticationOptions();
  const { data } = useClassSession(classId, sessionId);

  return useSWR(
    data &&
      getSolutionsControllerFindCurrentAnalysesV0Url(
        classId,
        sessionId,
        allTasksPlaceholder /* use placeholder to represent 'all'*/,
        {},
      ),
    () =>
      data
        ? Promise.all(
            data.tasks.map((task) =>
              fetchSolutionsAndTransform(
                authOptions,
                classId,
                sessionId,
                task.id,
              ).then(
                (analyses) =>
                  ({ taskId: task.id, analyses }) as SessionAnalyses,
              ),
            ),
          )
        : Promise.resolve([] as SessionAnalyses[]),
    refreshConfig,
  );
};
