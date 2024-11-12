import useSWR from "swr";
import {
  ApiResponse,
  fromDtos,
  getSwrParamererizedKey,
  transformToLazyTableResult,
} from "../helpers";
import { LazyTableResult, LazyTableState } from "@/components/DataTable";
import {
  getSessionsControllerFindAllV0Url,
  sessionsControllerFindAllV0,
} from "../../generated/endpoints/sessions/sessions";
import { ExistingSession } from "../../models/sessions/existing-session";

export type GetSessionsReturnType = ExistingSession[];

const fetchByClassIdAndTransform = (
  classId: number,
  _params?: undefined,
): Promise<GetSessionsReturnType> =>
  sessionsControllerFindAllV0(classId).then((data) =>
    fromDtos(ExistingSession, data),
  );

export const useAllClassSessions = (
  classId: number,
  params?: undefined,
): ApiResponse<GetSessionsReturnType, Error> =>
  useSWR(
    getSwrParamererizedKey(
      (_params?: undefined) => getSessionsControllerFindAllV0Url(classId),
      undefined,
    ),
    () => fetchByClassIdAndTransform(classId, params),
  );

export const useAllClassSessionsLazyTable = (
  classId: number,
  _state: LazyTableState,
): ApiResponse<LazyTableResult<GetSessionsReturnType[0]>, Error> =>
  useSWR(
    getSwrParamererizedKey(
      (_params?: undefined) => getSessionsControllerFindAllV0Url(classId),
      undefined,
    ),
    () => fetchByClassIdAndTransform(classId).then(transformToLazyTableResult),
  );
