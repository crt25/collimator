import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { invalidateParameterizedKey } from "../helpers";
import { getSessionsControllerFindAllV0Url } from "../../generated/endpoints/sessions/sessions";
import { SessionsControllerFindAllV0Params } from "../../generated/models";

const defaultParams: SessionsControllerFindAllV0Params = {};

export const useRevalidateClassSessionList = (): ((
  classId: number,
  params?: SessionsControllerFindAllV0Params,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (classId: number, params?: SessionsControllerFindAllV0Params) => {
      invalidateParameterizedKey(mutate, () =>
        getSessionsControllerFindAllV0Url(classId, params ?? defaultParams),
      );
    },
    [mutate],
  );
};
