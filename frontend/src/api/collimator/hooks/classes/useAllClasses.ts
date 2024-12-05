import useSWR from "swr";
import {
  classesControllerFindAllV0,
  getClassesControllerFindAllV0Url,
} from "../../generated/endpoints/classes/classes";
import { ClassesControllerFindAllV0Params } from "../../generated/models";
import {
  ApiResponse,
  fromDtos,
  getSwrParamererizedKey,
  transformToLazyTableResult,
} from "../helpers";
import { ExistingClassWithTeacher } from "../../models/classes/existing-class-with-teacher";
import { LazyTableResult, LazyTableState } from "@/components/DataTable";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";

export type GetClassesReturnType = ExistingClassWithTeacher[];

const fetchAndTransform = (
  options: RequestInit,
  params?: ClassesControllerFindAllV0Params,
): Promise<GetClassesReturnType> =>
  classesControllerFindAllV0(params, options).then((data) =>
    fromDtos(ExistingClassWithTeacher, data),
  );

export const useAllClasses = (
  params?: ClassesControllerFindAllV0Params,
): ApiResponse<GetClassesReturnType, Error> => {
  const authOptions = useAuthenticationOptions();

  return useSWR(
    // use the URL with the params as the first entry in the key for easier invalidation
    getSwrParamererizedKey(getClassesControllerFindAllV0Url, params),
    () => fetchAndTransform(authOptions, params),
  );
};

export const useAllClassesLazyTable = (
  _state: LazyTableState,
): ApiResponse<LazyTableResult<GetClassesReturnType[0]>, Error> => {
  const authOptions = useAuthenticationOptions();

  return useSWR(getSwrParamererizedKey(getClassesControllerFindAllV0Url), () =>
    fetchAndTransform(authOptions).then(transformToLazyTableResult),
  );
};
