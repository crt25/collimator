import useSWR from "swr";
import { ApiResponse, fromDtos } from "../helpers";
import {
  getSessionsControllerFindAllV0Url,
  sessionsControllerFindAllV0,
} from "../../generated/endpoints/sessions/sessions";
import { ExistingSession } from "../../models/sessions/existing-session";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { SessionsControllerFindAllV0Params } from "../../generated/models";

export type GetSessionsReturnType = ExistingSession[];

const defaultParams: SessionsControllerFindAllV0Params = {
  includeSoftDelete: false,
};

const fetchByClassIdAndTransform = (
  options: RequestInit,
  classId: number,
  params: SessionsControllerFindAllV0Params = defaultParams,
): Promise<GetSessionsReturnType> =>
  sessionsControllerFindAllV0(classId, params, options).then((data) =>
    fromDtos(ExistingSession, data),
  );

export const useAllClassSessions = (
  classId: number,
  params: SessionsControllerFindAllV0Params = defaultParams,
): ApiResponse<GetSessionsReturnType, Error> => {
  const authOptions = useAuthenticationOptions();

  return useSWR(getSessionsControllerFindAllV0Url(classId, params), () =>
    fetchByClassIdAndTransform(authOptions, classId, params),
  );
};
