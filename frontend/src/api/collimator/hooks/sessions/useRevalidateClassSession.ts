import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { getSessionsControllerFindOneV0Url } from "../../generated/endpoints/sessions/sessions";
import { SessionsControllerFindAllV0Params } from "../../generated/models";
import { GetSessionReturnType } from "./useClassSession";

const defaultParams: SessionsControllerFindAllV0Params = {};

export const useRevalidateClassSession = (): ((
  classId: number,
  sessionId: number,
  newSession?: GetSessionReturnType,
  params?: SessionsControllerFindAllV0Params,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (
      classId: number,
      sessionId: number,
      newSession?: GetSessionReturnType,
      params?: SessionsControllerFindAllV0Params,
    ) => {
      mutate(
        getSessionsControllerFindOneV0Url(
          classId,
          sessionId,
          params ?? defaultParams,
        ),
        newSession,
      );
    },
    [mutate],
  );
};
