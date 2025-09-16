import useSWR from "swr";
import { useMemo } from "react";
import { LazyTableResult } from "@/components/DataTable";
import {
  ApiResponse,
  fromDtos,
  getSwrParamererizedKey,
  transformToLazyTableResult,
} from "../helpers";
import {
  getUsersControllerFindAllV0Url,
  usersControllerFindAllV0,
} from "../../generated/endpoints/users/users";
import { ExistingUser } from "../../models/users/existing-user";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";

export type GetUsersReturnType = ExistingUser[];

const fetchAndTransform = (options: RequestInit): Promise<GetUsersReturnType> =>
  usersControllerFindAllV0(options).then((data) =>
    fromDtos(ExistingUser, data),
  );

export const useAllUsers = (): ApiResponse<GetUsersReturnType, Error> => {
  const authOptions = useAuthenticationOptions();

  // use the URL with the params as the first entry in the key for easier invalidation
  return useSWR(getSwrParamererizedKey(getUsersControllerFindAllV0Url), () =>
    fetchAndTransform(authOptions),
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
