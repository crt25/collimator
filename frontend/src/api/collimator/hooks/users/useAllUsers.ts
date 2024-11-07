import useSWR from "swr";
import { ApiResponse, fromDtos, transformToLazyTableResult } from "../helpers";
import { LazyTableResult, LazyTableState } from "@/components/DataTable";
import {
  getUsersControllerFindAllUrl,
  usersControllerFindAll,
} from "../../generated/endpoints/users/users";
import { ExistingUser } from "../../models/users/existing-user";

export type GetUsersReturnType = ExistingUser[];

const fetchAndTransform = (): Promise<GetUsersReturnType> =>
  usersControllerFindAll().then((data) => fromDtos(ExistingUser, data));

export const useAllUsers = (): ApiResponse<GetUsersReturnType, Error> =>
  // use the URL with the params as the first entry in the key for easier invalidation
  useSWR([getUsersControllerFindAllUrl(), getUsersControllerFindAllUrl()], () =>
    fetchAndTransform(),
  );

export const useAllUsersLazyTable = (
  _state: LazyTableState,
): ApiResponse<LazyTableResult<GetUsersReturnType[0]>, Error> =>
  useSWR([getUsersControllerFindAllUrl(), getUsersControllerFindAllUrl()], () =>
    fetchAndTransform().then(transformToLazyTableResult),
  );
