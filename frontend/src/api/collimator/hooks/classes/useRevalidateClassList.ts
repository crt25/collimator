import { useSWRConfig } from "swr";
import { useCallback } from "react";
import { getClassesControllerFindAllV0Url } from "../../generated/endpoints/classes/classes";
import { invalidateParameterizedKey } from "../helpers";

export const useRevalidateClassList = (): (() => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(() => {
    invalidateParameterizedKey(mutate, getClassesControllerFindAllV0Url);
  }, [mutate]);
};
