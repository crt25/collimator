import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { GetSessionReturnType } from "./useClassSession";
import { getSessionsControllerFindOneV0Url } from "../../generated/endpoints/sessions/sessions";

export const useRevalidateClassSession = (): ((
  classId: number,
  sessionId: number,
  newSession?: GetSessionReturnType,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (classId: number, sessionId: number, newSession?: GetSessionReturnType) => {
      mutate(getSessionsControllerFindOneV0Url(classId, sessionId), newSession);
    },
    [mutate],
  );
};
