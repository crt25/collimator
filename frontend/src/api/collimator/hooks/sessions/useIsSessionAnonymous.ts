import useSWR from "swr";
import {
  getSessionsControllerIsAnonymousV0Url,
  sessionsControllerIsAnonymousV0,
} from "../../generated/endpoints/sessions/sessions";
import { ApiResponse, getIdOrNaN } from "../helpers";

type IsSessionAnonymousType = (
  classId: number,
  sessionId: number,
) => Promise<boolean>;

const fetchAndTransform = (
  classId: number,
  sessionId: number,
): ReturnType<IsSessionAnonymousType> =>
  sessionsControllerIsAnonymousV0(classId, sessionId).then(
    (dto) => dto.isAnonymous,
  );

export const useIsSessionAnonymous = (
  classId?: number | string,
  id?: number | string,
): ApiResponse<boolean, Error> => {
  const numericClassId = getIdOrNaN(classId);
  const numericSessionId = getIdOrNaN(id);

  return useSWR(
    getSessionsControllerIsAnonymousV0Url(numericClassId, numericSessionId),
    () =>
      isNaN(numericClassId) || isNaN(numericSessionId)
        ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
          new Promise<boolean>(() => {})
        : fetchAndTransform(numericClassId, numericSessionId),
  );
};
