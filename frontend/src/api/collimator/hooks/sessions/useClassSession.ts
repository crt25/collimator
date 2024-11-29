import useSWR from "swr";
import { ApiResponse } from "../helpers";
import { ExistingSessionExtended } from "../../models/sessions/existing-session-extended";
import {
  getSessionsControllerFindOneV0Url,
  sessionsControllerFindOneV0,
} from "../../generated/endpoints/sessions/sessions";

export type GetSessionReturnType = ExistingSessionExtended;

const fetchByClassIdAndTransform = (
  classId: number,
  sessionId: number,
): Promise<GetSessionReturnType> =>
  sessionsControllerFindOneV0(classId, sessionId).then(
    ExistingSessionExtended.fromDto,
  );

export const useClassSession = (
  classId?: number | string,
  id?: number | string,
): ApiResponse<GetSessionReturnType, Error> => {
  const numericClassId =
    typeof classId === "number" ? classId : parseInt(classId ?? "no id", 10);
  const numericSessionId =
    typeof id === "number" ? id : parseInt(id ?? "no id", 10);

  return useSWR(
    getSessionsControllerFindOneV0Url(numericClassId, numericSessionId),
    () =>
      isNaN(numericClassId) || isNaN(numericSessionId)
        ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
          new Promise<GetSessionReturnType>(() => {})
        : fetchByClassIdAndTransform(numericClassId, numericSessionId),
  );
};
