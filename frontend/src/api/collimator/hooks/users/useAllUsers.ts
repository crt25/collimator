import useSWR from "swr";
import {
  ApiResponse,
  fromDtos,
  getSwrParamererizedKey,
  transformToLazyTableResult,
} from "../helpers";
import { LazyTableResult, LazyTableState } from "@/components/DataTable";
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

export const useAllUsersLazyTable = (
  _state: LazyTableState,
): ApiResponse<LazyTableResult<GetUsersReturnType[0]>, Error> => {
  const authOptions = useAuthenticationOptions();

  return useSWR(
    getSwrParamererizedKey(
      getUsersControllerFindAllV0Url,
      undefined,
      "lazyTable",
    ),
    () => fetchAndTransform(authOptions).then(transformToLazyTableResult),
  );
};
