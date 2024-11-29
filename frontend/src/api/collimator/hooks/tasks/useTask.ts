import useSWR from "swr";
import { ApiResponse, getIdOrNaN } from "../helpers";
import { ExistingTask } from "../../models/tasks/existing-task";
import {
  getTasksControllerDownloadOneV0Url,
  getTasksControllerFindOneV0Url,
  tasksControllerFindOneV0,
} from "../../generated/endpoints/tasks/tasks";
import { fetchFile } from "@/api/fetch";

export type GetTaskReturnType = ExistingTask;

const fetchAndTransform = (id: number): Promise<GetTaskReturnType> =>
  tasksControllerFindOneV0(id).then(ExistingTask.fromDto);

export const useTask = (
  id?: number | string,
): ApiResponse<GetTaskReturnType, Error> => {
  const numericId = getIdOrNaN(id);

  return useSWR(getTasksControllerFindOneV0Url(numericId), () =>
    isNaN(numericId)
      ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
        new Promise<GetTaskReturnType>(() => {})
      : fetchAndTransform(numericId),
  );
};

export const useTaskFile = (id?: number | string): ApiResponse<Blob, Error> => {
  const numericId = getIdOrNaN(id);

  return useSWR(getTasksControllerDownloadOneV0Url(numericId), () =>
    isNaN(numericId)
      ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
        new Promise<Blob>(() => {})
      : fetchFile(getTasksControllerDownloadOneV0Url(numericId), {
          method: "GET",
        }),
  );
};
