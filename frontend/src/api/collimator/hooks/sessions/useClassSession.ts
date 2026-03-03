import useSWR from "swr";
import { ApiResponse, getIdOrNaN } from "../helpers";
import { ExistingSessionExtended } from "../../models/sessions/existing-session-extended";
import {
  getSessionsControllerFindOneV0Url,
  sessionsControllerFindOneV0,
} from "../../generated/endpoints/sessions/sessions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";

export type GetSessionReturnType = ExistingSessionExtended;

const fetchAndTransform = (
  options: RequestInit,
  classId: number,
  sessionId: number,
): Promise<GetSessionReturnType> =>
  sessionsControllerFindOneV0(classId, sessionId, {}, options).then(
    ExistingSessionExtended.fromDto,
  );

export const useClassSession = (
  classId?: number | string,
  sessionId?: number | string,
): ApiResponse<GetSessionReturnType, Error> => {
  const numericClassId = getIdOrNaN(classId);
  const numericSessionId = getIdOrNaN(sessionId);

  const authOptions = useAuthenticationOptions();

  return useSWR(
    numericClassId && numericSessionId
      ? getSessionsControllerFindOneV0Url(numericClassId, numericSessionId, {})
      : undefined,
    () =>
      isNaN(numericClassId) || isNaN(numericSessionId)
        ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
          new Promise<GetSessionReturnType>(() => {})
        : fetchAndTransform(authOptions, numericClassId, numericSessionId),
  );
};
