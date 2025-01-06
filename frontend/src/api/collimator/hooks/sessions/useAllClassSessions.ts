import useSWR from "swr";
import { LazyTableResult, LazyTableState } from "@/components/DataTable";
import {
  ApiResponse,
  fromDtos,
  getSwrParamererizedKey,
  transformToLazyTableResult,
} from "../helpers";
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
  classId: number,
  params?: undefined,
): ApiResponse<GetSessionsReturnType, Error> => {
  const authOptions = useAuthenticationOptions();

  return useSWR(
    getSwrParamererizedKey(
      (_params?: undefined) => getSessionsControllerFindAllV0Url(classId),
      undefined,
    ),
    () => fetchByClassIdAndTransform(authOptions, classId, params),
  );
};

export const useAllClassSessionsLazyTable = (
  classId: number,
  _state: LazyTableState,
): ApiResponse<LazyTableResult<GetSessionsReturnType[0]>, Error> => {
  const authOptions = useAuthenticationOptions();

  return useSWR(
    getSwrParamererizedKey(
      (_params?: undefined) => getSessionsControllerFindAllV0Url(classId),
      undefined,
    ),
    () =>
      fetchByClassIdAndTransform(authOptions, classId).then(
        transformToLazyTableResult,
      ),
  );
};
