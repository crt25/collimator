import useSWR from "swr";
import { ApiResponse, fromDtos } from "../helpers";
import {
  getSessionsControllerFindAllV0Url,
  sessionsControllerFindAllV0,
} from "../../generated/endpoints/sessions/sessions";
import { ExistingSession } from "../../models/sessions/existing-session";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";

export type GetSessionsReturnType = ExistingSession[];

const fetchByClassIdAndTransform = (
  options: RequestInit,
  classId: number,
  _params?: undefined,
): Promise<GetSessionsReturnType> =>
  sessionsControllerFindAllV0(classId, options).then((data) =>
    fromDtos(ExistingSession, data),
  );

export const useAllClassSessions = (
  classId: number | null,
  params?: undefined,
): ApiResponse<GetSessionsReturnType, Error> => {
  const authOptions = useAuthenticationOptions();

  return useSWR(
    classId !== null
      ? getSessionsControllerFindAllV0Url(classId)
      : "useAllClassSessions:null",
    () =>
      classId !== null
        ? fetchByClassIdAndTransform(authOptions, classId, params)
        : Promise.resolve([]),
  );
};
