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
): Promise<GetSessionsReturnType> =>
  sessionsControllerFindAllV0(classId, {}, options).then((data) =>
    fromDtos(ExistingSession, data),
  );

// classId !== null ? getSessionsControllerFindAllV0Url(classId) : null,

export const useAllClassSessions = (
  classId: number,
): ApiResponse<GetSessionsReturnType, Error> => {
  const authOptions = useAuthenticationOptions();

  return useSWR(
    classId !== null ? getSessionsControllerFindAllV0Url(classId, {}) : null,
    () => fetchByClassIdAndTransform(authOptions, classId),
  );
};
