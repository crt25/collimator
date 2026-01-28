import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { invalidateParameterizedKey } from "../helpers";
import { getUsersControllerFindAllV0Url } from "../../generated/endpoints/users/users";
import { UsersControllerFindAllV0Params } from "../../generated/models";

const defaultParams: UsersControllerFindAllV0Params = {};

export const useRevalidateUserList = (): (() => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(() => {
    invalidateParameterizedKey(
      mutate,
      (params?: UsersControllerFindAllV0Params) =>
        getUsersControllerFindAllV0Url(params ?? defaultParams),
    );
  }, [mutate]);
};
