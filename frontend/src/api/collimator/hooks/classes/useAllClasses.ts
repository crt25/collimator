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
import { useContext, useMemo } from "react";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { UserRole } from "@/types/user/user-role";

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
  const authenticationContext = useContext(AuthenticationContext);
  const authOptions = useAuthenticationOptions();

  const parameters = useMemo<ClassesControllerFindAllV0Params>(() => {
    const parameters: ClassesControllerFindAllV0Params = { ...params };

    // if the user is a teacher, only fetch classes for that teacher
    if (authenticationContext.role === UserRole.teacher) {
      parameters.teacherId = authenticationContext.userId;
    }

    return parameters;
  }, [params, authenticationContext]);

  return useSWR(
    // use the URL with the params as the first entry in the key for easier invalidation
    getSwrParamererizedKey(getClassesControllerFindAllV0Url, parameters),
    () => fetchAndTransform(authOptions, parameters),
  );
};

export const useAllClassesLazyTable = (
  _state: LazyTableState,
): ApiResponse<LazyTableResult<GetClassesReturnType[0]>, Error> => {
  const { data, isLoading, error } = useAllClasses();

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
