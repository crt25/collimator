import useSWR from "swr";
import {
  classesControllerFindAll,
  getClassesControllerFindAllUrl,
} from "../../generated/endpoints/classes/classes";
import { ClassesControllerFindAllParams } from "../../generated/models";
import { ApiResponse, fromDtos, transformToLazyTableResult } from "../helpers";
import { ExistingClassWithTeacher } from "../../models/classes/existing-class-with-teacher";
import { LazyTableResult, LazyTableState } from "@/components/DataTable";

export type GetClassesReturnType = ExistingClassWithTeacher[];

const fetchAndTransform = (
  params?: ClassesControllerFindAllParams,
): Promise<GetClassesReturnType> =>
  classesControllerFindAll(params).then((data) =>
    fromDtos(ExistingClassWithTeacher, data),
  );

export const useAllClasses = (
  params?: ClassesControllerFindAllParams,
): ApiResponse<GetClassesReturnType, Error> =>
  useSWR(
    // use the URL with the params as the first entry in the key for easier invalidation
    [getClassesControllerFindAllUrl(), getClassesControllerFindAllUrl(params)],
    () => fetchAndTransform(params),
  );

export const useAllClassesLazyTable = (
  _state: LazyTableState,
): ApiResponse<LazyTableResult<GetClassesReturnType[0]>, Error> =>
  useSWR(
    [getClassesControllerFindAllUrl(), getClassesControllerFindAllUrl()],
    () => fetchAndTransform().then(transformToLazyTableResult),
  );
