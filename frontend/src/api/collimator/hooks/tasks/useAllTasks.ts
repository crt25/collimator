import useSWR from "swr";
import { useMemo } from "react";
import { LazyTableResult, LazyTableState } from "@/components/DataTable";
import {
  ApiResponse,
  fromDtos,
  getSwrParamererizedKey,
  transformToLazyTableResult,
} from "../helpers";
import {
  getTasksControllerFindAllV0Url,
  tasksControllerFindAllV0,
} from "../../generated/endpoints/tasks/tasks";
import { ExistingTask } from "../../models/tasks/existing-task";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";

export type GetTasksReturnType = ExistingTask[];

const fetchAndTransform = (options: RequestInit): Promise<GetTasksReturnType> =>
  tasksControllerFindAllV0(options).then((data) =>
    fromDtos(ExistingTask, data),
  );

export const useAllTasks = (): ApiResponse<GetTasksReturnType, Error> => {
  const authOptions = useAuthenticationOptions();

  // use the URL with the params as the first entry in the key for easier invalidation
  return useSWR(getSwrParamererizedKey(getTasksControllerFindAllV0Url), () =>
    fetchAndTransform(authOptions),
  );
};

export const useAllTasksLazyTable = (
  _state: LazyTableState,
): ApiResponse<LazyTableResult<GetTasksReturnType[0]>, Error> => {
  const { data, isLoading, error } = useAllTasks();

  const transformedData = useMemo(() => {
    if (!data) {
      return undefined;
    }

    return transformToLazyTableResult(data);
  }, [data]);

  return {
    data: transformedData,
    isLoading,
    error,
  };
};
