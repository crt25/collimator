import useSWR from "swr";
import {
  classesControllerFindAllV0,
  getClassesControllerFindAllV0Url,
} from "../../generated/endpoints/classes/classes";
import { ClassesControllerFindAllV0Params } from "../../generated/models";
import { ApiResponse, fromDtos, transformToLazyTableResult } from "../helpers";
import { ExistingClassWithTeacher } from "../../models/classes/existing-class-with-teacher";
import { LazyTableResult, LazyTableState } from "@/components/DataTable";

export type GetClassesReturnType = ExistingClassWithTeacher[];

const fetchAndTransform = (
  params?: ClassesControllerFindAllV0Params,
): Promise<GetClassesReturnType> =>
  classesControllerFindAllV0(params).then((data) =>
    fromDtos(ExistingClassWithTeacher, data),
  );

export const useAllClasses = (
  params?: ClassesControllerFindAllV0Params,
): ApiResponse<GetClassesReturnType, Error> =>
  useSWR(
    // use the URL with the params as the first entry in the key for easier invalidation
    [getClassesControllerFindAllV0Url(), getClassesControllerFindAllV0Url(params)],
    () => fetchAndTransform(params),
  );

export const useAllClassesLazyTable = (
  _state: LazyTableState,
): ApiResponse<LazyTableResult<GetClassesReturnType[0]>, Error> =>
  useSWR(
    [getClassesControllerFindAllV0Url(), getClassesControllerFindAllV0Url()],
    () => fetchAndTransform().then(transformToLazyTableResult),
  );
