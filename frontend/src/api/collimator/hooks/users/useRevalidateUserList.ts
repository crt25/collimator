import { useSWRConfig } from "swr";
import { invalidateParameterizedKey } from "../helpers";
import { useCallback } from "react";
import { getUsersControllerFindAllV0Url } from "../../generated/endpoints/users/users";

export const useRevalidateUserList = (): (() => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(() => {
    invalidateParameterizedKey(mutate, getUsersControllerFindAllV0Url);
  }, [mutate]);
};
