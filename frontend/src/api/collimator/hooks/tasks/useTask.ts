import useSWR from "swr";
import { fetchFile } from "@/api/fetch";
import { ApiResponse, getIdOrNaN } from "../helpers";
import { ExistingTask } from "../../models/tasks/existing-task";
import {
  getTasksControllerDownloadOneV0Url,
  getTasksControllerFindOneV0Url,
  tasksControllerFindOneV0,
} from "../../generated/endpoints/tasks/tasks";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import {
  TasksControllerFindOneV0Params,
  TasksControllerDownloadOneV0Params,
} from "../../generated/models";

export type GetTaskReturnType = ExistingTask;

const findOneDefaultParams: TasksControllerFindOneV0Params = {};

const downloadOneDefaultParams: TasksControllerDownloadOneV0Params = {};

const fetchAndTransform = (
  options: RequestInit,
  id: number,
  params: TasksControllerFindOneV0Params = findOneDefaultParams,
): Promise<GetTaskReturnType> =>
  tasksControllerFindOneV0(id, params, options).then(ExistingTask.fromDto);

export const useTask = (
  id?: number | string,
  params: TasksControllerFindOneV0Params = findOneDefaultParams,
): ApiResponse<GetTaskReturnType, Error> => {
  const numericId = getIdOrNaN(id);
  const authOptions = useAuthenticationOptions();

  return useSWR(getTasksControllerFindOneV0Url(numericId, params), () =>
    isNaN(numericId)
      ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
        new Promise<GetTaskReturnType>(() => {})
      : fetchAndTransform(authOptions, numericId, params),
  );
};

export const useTaskFile = (
  id?: number | string,
  params: TasksControllerDownloadOneV0Params = downloadOneDefaultParams,
): ApiResponse<Blob, Error> => {
  const numericId = getIdOrNaN(id);
  const authOptions = useAuthenticationOptions();

  return useSWR(getTasksControllerDownloadOneV0Url(numericId, params), () =>
    isNaN(numericId)
      ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
        new Promise<Blob>(() => {})
      : fetchFile(getTasksControllerDownloadOneV0Url(numericId, params), {
          ...authOptions,
          method: "GET",
        }),
  );
};
