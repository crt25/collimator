import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { invalidateParameterizedKey } from "../helpers";
import { getSessionsControllerFindAllV0Url } from "../../generated/endpoints/sessions/sessions";

export const useRevalidateClassSessionList = (): ((
  classId: number,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (classId: number) => {
      invalidateParameterizedKey(mutate, () =>
        getSessionsControllerFindAllV0Url(classId),
      );
    },
    [mutate],
  );
};
