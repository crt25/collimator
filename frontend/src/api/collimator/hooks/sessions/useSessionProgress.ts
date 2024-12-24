import useSWR from "swr";
import { ApiResponse, getSwrParamererizedKey } from "../helpers";
import {
  getSessionsControllerGetSessionProgressV0Url,
  sessionsControllerGetSessionProgressV0,
} from "../../generated/endpoints/sessions/sessions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { StudentSessionProgress } from "../../models/sessions/student-session-progress";
const fetchByClassIdAndTransform = (
  options: RequestInit,
  classId: number,
  sessionId: number,
): Promise<StudentSessionProgress> =>
  sessionsControllerGetSessionProgressV0(classId, sessionId, options).then(
    StudentSessionProgress.fromDto,
  );

export const useSessionProgress = (
  classId: number,
  sessionId: number,
): ApiResponse<StudentSessionProgress, Error> => {
  const authOptions = useAuthenticationOptions();

  return useSWR(
    getSwrParamererizedKey(
      (_params?: undefined) =>
        getSessionsControllerGetSessionProgressV0Url(classId, sessionId),
      undefined,
    ),
    () => fetchByClassIdAndTransform(authOptions, classId, sessionId),
  );
};
