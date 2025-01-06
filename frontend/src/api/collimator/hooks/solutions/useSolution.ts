import useSWR from "swr";
import { useCallback } from "react";
import { fetchFile } from "@/api/fetch";
import { ApiResponse, getIdOrNaN } from "../helpers";
import {
  getSolutionsControllerDownloadOneV0Url,
  getSolutionsControllerFindOneV0Url,
  getSolutionsControllerLatestSolutionV0Url,
  solutionsControllerFindOneV0,
} from "../../generated/endpoints/solutions/solutions";
import { ExistingSolution } from "../../models/solutions/existing-solution";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";

export type GetSolutionReturnType = ExistingSolution;

const fetchAndTransform = (
  classId: number,
  sessionId: number,
  taskId: number,
  id: number,
): Promise<GetSolutionReturnType> =>
  solutionsControllerFindOneV0(classId, sessionId, taskId, id).then(
    ExistingSolution.fromDto,
  );

export const useSolution = (
  classId?: string | number,
  sessionId?: string | number,
  taskId?: string | number,
  id?: string | number,
): ApiResponse<GetSolutionReturnType, Error> => {
  const numericClassId = getIdOrNaN(classId);
  const numericSessionId = getIdOrNaN(sessionId);
  const numericTaskId = getIdOrNaN(taskId);
  const numericSolutionId = getIdOrNaN(id);

  return useSWR(
    getSolutionsControllerFindOneV0Url(
      numericClassId,
      numericSessionId,
      numericTaskId,
      numericSolutionId,
    ),
    () =>
      isNaN(numericClassId) ||
      isNaN(numericSessionId) ||
      isNaN(numericTaskId) ||
      isNaN(numericSolutionId)
        ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
          new Promise<GetSolutionReturnType>(() => {})
        : fetchAndTransform(
            numericClassId,
            numericSessionId,
            numericTaskId,
            numericSolutionId,
          ),
  );
};

export const useSolutionFile = (
  classId?: string | number,
  sessionId?: string | number,
  taskId?: string | number,
  id?: string | number,
): ApiResponse<Blob, Error> => {
  const numericClassId = getIdOrNaN(classId);
  const numericSessionId = getIdOrNaN(sessionId);
  const numericTaskId = getIdOrNaN(taskId);
  const numericSolutionId = getIdOrNaN(id);

  const authOptions = useAuthenticationOptions();

  return useSWR(
    getSolutionsControllerDownloadOneV0Url(
      numericClassId,
      numericSessionId,
      numericTaskId,
      numericSolutionId,
    ),
    () =>
      isNaN(numericClassId) ||
      isNaN(numericSessionId) ||
      isNaN(numericTaskId) ||
      isNaN(numericSolutionId)
        ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
          new Promise<Blob>(() => {})
        : fetchFile(
            getSolutionsControllerDownloadOneV0Url(
              numericClassId,
              numericSessionId,
              numericTaskId,
              numericSolutionId,
            ),
            {
              ...authOptions,
              method: "GET",
            },
          ),
  );
};

export const useFetchLatestSolutionFile = (): ((
  classId: number,
  sessionId: number,
  taskId: number,
) => Promise<Blob>) => {
  const authOptions = useAuthenticationOptions();

  return useCallback(
    (classId: number, sessionId: number, taskId: number) =>
      fetchFile(
        getSolutionsControllerLatestSolutionV0Url(classId, sessionId, taskId),
        {
          ...authOptions,
          method: "GET",
        },
      ),
    [authOptions],
  );
};
