import useSWR from "swr";
import { ApiResponse, getIdOrNaN } from "../helpers";
import { ExistingSessionExtended } from "../../models/sessions/existing-session-extended";
import {
  getSessionsControllerFindOneV0Url,
  sessionsControllerFindOneV0,
} from "../../generated/endpoints/sessions/sessions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { SessionsControllerFindAllV0Params } from "../../generated/models";

export type GetSessionReturnType = ExistingSessionExtended;

const defaultParams: SessionsControllerFindAllV0Params = {};

const fetchByClassIdAndTransform = (
  options: RequestInit,
  classId: number,
  sessionId: number,
  params: SessionsControllerFindAllV0Params = defaultParams,
): Promise<GetSessionReturnType> =>
  sessionsControllerFindOneV0(classId, sessionId, params, options).then(
    ExistingSessionExtended.fromDto,
  );

export const useClassSession = (
  classId?: number | string,
  id?: number | string,
  params: SessionsControllerFindAllV0Params = defaultParams,
): ApiResponse<GetSessionReturnType, Error> => {
  const numericClassId = getIdOrNaN(classId);
  const numericSessionId = getIdOrNaN(id);

  const authOptions = useAuthenticationOptions();

  return useSWR(
    getSessionsControllerFindOneV0Url(numericClassId, numericSessionId, params),
    () =>
      isNaN(numericClassId) || isNaN(numericSessionId)
        ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
          new Promise<GetSessionReturnType>(() => {})
        : fetchByClassIdAndTransform(
            authOptions,
            numericClassId,
            numericSessionId,
            params,
          ),
  );
};
