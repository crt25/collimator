import useSWR from "swr";
import { ApiResponse, fromDtos, transformToLazyTableResult } from "../helpers";
import { LazyTableResult, LazyTableState } from "@/components/DataTable";
import {
  getUsersControllerFindAllV0Url,
  usersControllerFindAllV0,
} from "../../generated/endpoints/users/users";
import { ExistingUser } from "../../models/users/existing-user";

export type GetUsersReturnType = ExistingUser[];

const fetchAndTransform = (): Promise<GetUsersReturnType> =>
  usersControllerFindAllV0().then((data) => fromDtos(ExistingUser, data));

export const useAllUsers = (): ApiResponse<GetUsersReturnType, Error> =>
  // use the URL with the params as the first entry in the key for easier invalidation
  useSWR([getUsersControllerFindAllV0Url(), getUsersControllerFindAllV0Url()], () =>
    fetchAndTransform(),
  );

export const useAllUsersLazyTable = (
  _state: LazyTableState,
): ApiResponse<LazyTableResult<GetUsersReturnType[0]>, Error> =>
  useSWR([getUsersControllerFindAllV0Url(), getUsersControllerFindAllV0Url()], () =>
    fetchAndTransform().then(transformToLazyTableResult),
  );
