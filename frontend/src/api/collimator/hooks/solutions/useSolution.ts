import useSWR from "swr";
import { useCallback } from "react";
import { fetchFile } from "@/api/fetch";
import { ApiResponse, getIdOrNaN } from "../helpers";
import {
  getSolutionsControllerDownloadLatestStudentSolutionV0Url,
  getSolutionsControllerDownloadOneV0Url,
  getSolutionsControllerFindOneStudentSolutionV0Url,
  solutionsControllerFindOneStudentSolutionV0,
} from "../../generated/endpoints/solutions/solutions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { ExistingStudentSolution } from "../../models/solutions/existing-student-solutions";
import {
  SolutionsControllerDownloadLatestStudentSolutionV0Params,
  SolutionsControllerDownloadOneV0Params,
  SolutionsControllerFindOneStudentSolutionV0Params,
} from "../../generated/models";

export type GetSolutionReturnType = ExistingStudentSolution;

const findOneStudentSolutiondefaultParams: SolutionsControllerFindOneStudentSolutionV0Params = {};

const fetchAndTransform = (
  classId: number,
  sessionId: number,
  taskId: number,
  id: number,
  params: SolutionsControllerFindOneStudentSolutionV0Params = findOneStudentSolutiondefaultParams,
): Promise<GetSolutionReturnType> =>
  solutionsControllerFindOneStudentSolutionV0(
    classId,
    sessionId,
    taskId,
    id,
    params ?? findOneStudentSolutiondefaultParams,
  ).then(ExistingStudentSolution.fromDto);

export const useSolution = (
  classId?: string | number,
  sessionId?: string | number,
  taskId?: string | number,
  id?: string | number,
  params?: SolutionsControllerFindOneStudentSolutionV0Params,
): ApiResponse<GetSolutionReturnType, Error> => {
  const numericClassId = getIdOrNaN(classId);
  const numericSessionId = getIdOrNaN(sessionId);
  const numericTaskId = getIdOrNaN(taskId);
  const numericSolutionId = getIdOrNaN(id);

  return useSWR(
    getSolutionsControllerFindOneStudentSolutionV0Url(
      numericClassId,
      numericSessionId,
      numericTaskId,
      numericSolutionId,
      params ?? findOneStudentSolutiondefaultParams,
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
            params ?? findOneStudentSolutiondefaultParams,
          ),
  );
};

const downloadOneParams: SolutionsControllerDownloadOneV0Params = {};

export const useSolutionFile = (
  classId?: string | number,
  sessionId?: string | number,
  taskId?: string | number,
  solutionHash?: string,
  params?: SolutionsControllerDownloadOneV0Params,
): ApiResponse<Blob, Error> => {
  const numericClassId = getIdOrNaN(classId);
  const numericSessionId = getIdOrNaN(sessionId);
  const numericTaskId = getIdOrNaN(taskId);

  const authOptions = useAuthenticationOptions();

  return useSWR(
    getSolutionsControllerDownloadOneV0Url(
      numericClassId,
      numericSessionId,
      numericTaskId,
      solutionHash ?? "",
      params ?? downloadOneParams,
    ),
    () =>
      isNaN(numericClassId) ||
      isNaN(numericSessionId) ||
      isNaN(numericTaskId) ||
      solutionHash === undefined
        ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
          new Promise<Blob>(() => {})
        : fetchFile(
            getSolutionsControllerDownloadOneV0Url(
              numericClassId,
              numericSessionId,
              numericTaskId,
              solutionHash,
              params ?? downloadOneParams,
            ),
            {
              ...authOptions,
              method: "GET",
            },
          ),
  );
};

const downloadLatestParams: SolutionsControllerDownloadLatestStudentSolutionV0Params = {};

export const useFetchLatestSolutionFile = (): ((
  classId: number,
  sessionId: number,
  taskId: number,
  params?: SolutionsControllerDownloadLatestStudentSolutionV0Params,
) => Promise<Blob>) => {
  const authOptions = useAuthenticationOptions();

  return useCallback(
    (
      classId: number,
      sessionId: number,
      taskId: number,
      params?: SolutionsControllerDownloadLatestStudentSolutionV0Params,
    ) =>
      fetchFile(
        getSolutionsControllerDownloadLatestStudentSolutionV0Url(
          classId,
          sessionId,
          taskId,
          params ?? downloadLatestParams,
        ),
        {
          ...authOptions,
          method: "GET",
        },
      ),
    [authOptions],
  );
};
