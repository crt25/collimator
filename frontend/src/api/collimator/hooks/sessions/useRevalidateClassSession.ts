import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { getSessionsControllerFindOneV0Url } from "../../generated/endpoints/sessions/sessions";
import { GetSessionReturnType } from "./useClassSession";

export const useRevalidateClassSession = (): ((
  classId: number,
  sessionId: number,
  newSession?: GetSessionReturnType,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (classId: number, sessionId: number, newSession?: GetSessionReturnType) => {
      mutate(
        getSessionsControllerFindOneV0Url(classId, sessionId, {}),
        newSession,
      );
    },
    [mutate],
  );
};
