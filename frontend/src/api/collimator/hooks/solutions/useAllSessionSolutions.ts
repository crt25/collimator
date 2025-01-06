import useSWR from "swr";
import { ApiResponse } from "../helpers";
import { getSolutionsControllerFindAllV0Url } from "../../generated/endpoints/solutions/solutions";
import { useClassSession } from "../sessions/useClassSession";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import {
  fetchSolutionsAndTransform,
  GetSolutionsReturnType,
} from "./useAllSessionTaskSolutions";

export const allTasksPlaceholder = -1;

type SessionSolution = { taskId: number; solutions: GetSolutionsReturnType };

export const useAllSessionSolutions = (
  classId: number,
  sessionId: number,
): ApiResponse<SessionSolution[], Error> => {
  const authOptions = useAuthenticationOptions();
  const { data } = useClassSession(classId, sessionId);

  return useSWR(
    // if the key is falsy, the request will not be made.
    // here we want to wait for the class session to be loaded before starting to fetch
    // solutions
    data &&
      getSolutionsControllerFindAllV0Url(
        classId,
        sessionId,
        allTasksPlaceholder /* use placeholder to represent 'all'*/,
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
                undefined,
              ).then(
                (solutions) =>
                  ({ taskId: task.id, solutions }) as SessionSolution,
              ),
            ),
          )
        : Promise.resolve([] as SessionSolution[]),
  );
};
