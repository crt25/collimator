import useSWR from "swr";
import { getClassesControllerFindAllV0Url } from "../../generated/endpoints/classes/classes";
import { ClassesControllerFindAllV0Params } from "../../generated/models";
import {
  ApiResponse,
  fromDtos,
  LazyTableFetchFunctionWithParameters,
  transformToLazyTableResult,
} from "../helpers";
import { LazyTableState } from "@/components/DataTable";
import { useCallback } from "react";
import { usersControllerFindAllV0 } from "../../generated/endpoints/users/users";
import { ExistingUser } from "../../models/users/existing-user";

const fetchAndTransform = (): Promise<ExistingUser[]> =>
  usersControllerFindAllV0().then((data) => fromDtos(ExistingUser, data));

export const useAllUsers = (): ApiResponse<ExistingUser[], Error> =>
  useSWR(getClassesControllerFindAllV0Url(), () => fetchAndTransform());

export const useFetchAllUsers: LazyTableFetchFunctionWithParameters<
  ClassesControllerFindAllV0Params,
  ExistingUser
> = () =>
  useCallback(
    (_state: LazyTableState) =>
      fetchAndTransform().then(transformToLazyTableResult),
    [],
  );
