import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { GetSessionReturnType } from "./useClassSession";
import { useRevalidateClassSessionList } from "./useRevalidateClassSessionList";
import {
  getSessionsControllerFindOneV0Url,
  sessionsControllerUpdateV0,
} from "../../generated/endpoints/sessions/sessions";
import { ExistingSession } from "../../models/sessions/existing-session";
import { ExistingSessionExtended } from "../../models/sessions/existing-session-extended";

type Args = Parameters<typeof sessionsControllerUpdateV0>;
type UpdateSessionType = (...args: Args) => Promise<ExistingSession>;

const fetchAndTransform: UpdateSessionType = (...args) =>
  sessionsControllerUpdateV0(...args).then(ExistingSession.fromDto);

export const useUpdateClassSession = (): UpdateSessionType => {
  const { mutate, cache } = useSWRConfig();
  const revalidateList = useRevalidateClassSessionList();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        // revalidate the updated session
        const classId = args[0];

        const key = getSessionsControllerFindOneV0Url(classId, result.id);

        const cachedData: GetSessionReturnType | undefined =
          cache.get(key)?.data;

        if (cachedData === undefined) {
          mutate(key);

          return result;
        }

        // perform an optimistic partial update but also revalidate the data
        // to make sure it's up to date (for instance we don't have enough information to update the task list)
        const updatedData: GetSessionReturnType =
          ExistingSessionExtended.fromDto({
            ...cachedData,
            class: cachedData.klass,
            ...result,
          });

        mutate(key, updatedData, {
          revalidate: true,
        });

        revalidateList(classId);

        return result;
      }),
    [mutate, cache, revalidateList],
  );
};
