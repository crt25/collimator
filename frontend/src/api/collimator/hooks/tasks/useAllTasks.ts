import useSWR from "swr";
import { ApiResponse, fromDtos, transformToLazyTableResult } from "../helpers";
import { LazyTableResult, LazyTableState } from "@/components/DataTable";
import { getTasksControllerFindAllV0Url, tasksControllerFindAllV0 } from "../../generated/endpoints/tasks/tasks";
import { ExistingTask } from "../../models/tasks/existing-task";

export type GetTasksReturnType = ExistingTask[];

const fetchAndTransform = (): Promise<GetTasksReturnType> =>
  tasksControllerFindAllV0().then((data) => fromDtos(ExistingTask, data));

export const useAllTasks = (): ApiResponse<GetTasksReturnType, Error> =>
  // use the URL with the params as the first entry in the key for easier invalidation
  useSWR(
    [getTasksControllerFindAllV0Url(), getTasksControllerFindAllV0Url()],
    () => fetchAndTransform(),
  );

export const useAllTasksLazyTable = (
  _state: LazyTableState,
): ApiResponse<LazyTableResult<GetTasksReturnType[0]>, Error> =>
  useSWR(
    [getTasksControllerFindAllV0Url(), getTasksControllerFindAllV0Url()],
    () => fetchAndTransform().then(transformToLazyTableResult),
  );
