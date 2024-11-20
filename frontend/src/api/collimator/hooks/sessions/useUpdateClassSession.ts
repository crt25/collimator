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
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { UpdateSessionDto } from "../../generated/models";

type UpdateSessionType = (
  classId: number,
  id: number,
  updateSessionDto: UpdateSessionDto,
) => Promise<ExistingSession>;

const fetchAndTransform = (
  options: RequestInit,
  classId: number,
  id: number,
  updateSessionDto: UpdateSessionDto,
): ReturnType<UpdateSessionType> =>
  sessionsControllerUpdateV0(classId, id, updateSessionDto, options).then(
    ExistingSession.fromDto,
  );

export const useUpdateClassSession = (): UpdateSessionType => {
  const authOptions = useAuthenticationOptions();
  const { mutate, cache } = useSWRConfig();
  const revalidateList = useRevalidateClassSessionList();

  return useCallback<UpdateSessionType>(
    (classId, id, updateSessionDto) =>
      fetchAndTransform(authOptions, classId, id, updateSessionDto).then(
        (result) => {
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
        },
      ),
    [authOptions, mutate, cache, revalidateList],
  );
};
