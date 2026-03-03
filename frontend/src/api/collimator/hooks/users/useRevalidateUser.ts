import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { getUsersControllerFindOneV0Url } from "../../generated/endpoints/users/users";
import { GetUserReturnType } from "./useUser";

export const useRevalidateUser = (): ((
  userId: number,
  newUser?: GetUserReturnType,
) => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (userId: number, newUser?: GetUserReturnType) => {
      mutate(getUsersControllerFindOneV0Url(userId, {}), newUser);
    },
    [mutate],
  );
};
