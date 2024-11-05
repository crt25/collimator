import useSWR from "swr";
import {
  classesControllerFindAll,
  getClassesControllerFindAllUrl,
} from "../generated/endpoints/classes/classes";
import { ClassesControllerFindAllParams } from "../generated/models";
import {
  ApiResponse,
  fromDto,
  LazyTableFetchFunctionWithParameters,
  transformSwrOutput,
  transformToLazyTableResult,
} from "./helpers";
import { ExistingClassWithTeacher } from "../models/classes/existing-class-with-teacher";
import { LazyTableState } from "@/components/DataTable";
import { useCallback } from "react";

const fetchAndTransform = (
  params?: ClassesControllerFindAllParams,
): Promise<ExistingClassWithTeacher[]> =>
  classesControllerFindAll(params).then((data) =>
    fromDto(ExistingClassWithTeacher, data),
  );

export const useAllClasses = (
  params?: ClassesControllerFindAllParams,
): ApiResponse<ExistingClassWithTeacher[], unknown> =>
  transformSwrOutput(
    useSWR(getClassesControllerFindAllUrl(params), () =>
      fetchAndTransform(params),
    ),
  );

export const useFetchAllClasses: LazyTableFetchFunctionWithParameters<
  ClassesControllerFindAllParams,
  ExistingClassWithTeacher
> = (params) =>
  useCallback(
    (_state: LazyTableState) =>
      fetchAndTransform(params).then(transformToLazyTableResult),
    [params],
  );
