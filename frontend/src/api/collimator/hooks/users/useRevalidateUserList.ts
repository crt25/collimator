import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { invalidateParameterizedKey } from "../helpers";
import { getUsersControllerFindAllV0Url } from "../../generated/endpoints/users/users";

export const useRevalidateUserList = (): (() => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(() => {
    invalidateParameterizedKey(mutate, getUsersControllerFindAllV0Url);
  }, [mutate]);
};
