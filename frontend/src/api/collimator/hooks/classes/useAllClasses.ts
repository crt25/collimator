import useSWR from "swr";
import {
  classesControllerFindAllV0,
  getClassesControllerFindAllV0Url,
} from "../../generated/endpoints/classes/classes";
import { ClassesControllerFindAllV0Params } from "../../generated/models";
import {
  ApiResponse,
  fromDtos,
  LazyTableFetchFunctionWithParameters,
  transformToLazyTableResult,
} from "../helpers";
import { ExistingClassWithTeacher } from "../../models/classes/existing-class-with-teacher";
import { LazyTableState } from "@/components/DataTable";
import { useCallback } from "react";

const fetchAndTransform = (
  params?: ClassesControllerFindAllV0Params,
): Promise<ExistingClassWithTeacher[]> =>
  classesControllerFindAllV0(params).then((data) =>
    fromDtos(ExistingClassWithTeacher, data),
  );

export const useAllClasses = (
  params?: ClassesControllerFindAllV0Params,
): ApiResponse<ExistingClassWithTeacher[], Error> =>
  useSWR(getClassesControllerFindAllV0Url(params), () =>
    fetchAndTransform(params),
  );

export const useFetchAllClasses: LazyTableFetchFunctionWithParameters<
  ClassesControllerFindAllV0Params,
  ExistingClassWithTeacher
> = (params) =>
  useCallback(
    (_state: LazyTableState) =>
      fetchAndTransform(params).then(transformToLazyTableResult),
    [params],
  );
