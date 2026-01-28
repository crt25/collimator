import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { getUsersControllerFindOneV0Url } from "../../generated/endpoints/users/users";
import { UsersControllerFindOneV0Params } from "../../generated/models";
import { GetUserReturnType } from "./useUser";

const defaultParams: UsersControllerFindOneV0Params = {};

export const useRevalidateUser = (): ((
  userId: number,
  newUser?: GetUserReturnType,
  params?: UsersControllerFindOneV0Params,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (
      userId: number,
      newUser?: GetUserReturnType,
      params: UsersControllerFindOneV0Params = defaultParams,
    ) => {
      mutate(getUsersControllerFindOneV0Url(userId, params), newUser);
    },
    [mutate],
  );
};
