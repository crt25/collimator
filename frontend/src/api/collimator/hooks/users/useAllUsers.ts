import useSWR from "swr";
import { getClassesControllerFindAllUrl } from "../../generated/endpoints/classes/classes";
import { ClassesControllerFindAllParams } from "../../generated/models";
import {
  ApiResponse,
  fromDtos,
  LazyTableFetchFunctionWithParameters,
  transformToLazyTableResult,
} from "../helpers";
import { LazyTableState } from "@/components/DataTable";
import { useCallback } from "react";
import { usersControllerFindAll } from "../../generated/endpoints/users/users";
import { ExistingUser } from "../../models/users/existing-user";

export type GetUsersReturnType = ExistingUser[];

const fetchAndTransform = (): Promise<GetUsersReturnType> =>
  usersControllerFindAll().then((data) => fromDtos(ExistingUser, data));

export const useAllUsers = (): ApiResponse<GetUsersReturnType, Error> =>
  useSWR(getClassesControllerFindAllUrl(), () => fetchAndTransform());

export const useFetchAllUsers: LazyTableFetchFunctionWithParameters<
  ClassesControllerFindAllParams,
  GetUsersReturnType[0]
> = () =>
  useCallback(
    (_state: LazyTableState) =>
      fetchAndTransform().then(transformToLazyTableResult),
    [],
  );
