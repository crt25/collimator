import useSWR from "swr";
import { useMemo } from "react";
import { LazyTableResult } from "@/components/DataTable";
import { ApiResponse, fromDtos, transformToLazyTableResult } from "../helpers";
import {
  getUsersControllerFindAllV0Url,
  usersControllerFindAllV0,
} from "../../generated/endpoints/users/users";
import { ExistingUser } from "../../models/users/existing-user";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { UsersControllerFindAllV0Params } from "../../generated/models";

export type GetUsersReturnType = ExistingUser[];

const defaultParams: UsersControllerFindAllV0Params = {};

const fetchAndTransform = (
  options: RequestInit,
  params: UsersControllerFindAllV0Params = defaultParams,
): Promise<GetUsersReturnType> =>
  usersControllerFindAllV0(params, options).then((data) =>
    fromDtos(ExistingUser, data),
  );

export const useAllUsers = (
  params: UsersControllerFindAllV0Params = defaultParams,
): ApiResponse<GetUsersReturnType, Error> => {
  const authOptions = useAuthenticationOptions();

  // use the URL with the params as the first entry in the key for easier invalidation
  return useSWR(getUsersControllerFindAllV0Url(params), () =>
    fetchAndTransform(authOptions, params),
  );
};

export const useAllUsersLazyTable = (): ApiResponse<
  LazyTableResult<GetUsersReturnType[0]>,
  Error
> => {
  const { data, isLoading, error } = useAllUsers();

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
