import { useSWRConfig } from "swr";
import { getClassesControllerFindAllV0Url } from "../../generated/endpoints/classes/classes";
import { invalidateParameterizedKey } from "../helpers";
import { useCallback } from "react";

export const useRevalidateClassList = (): (() => void) => {
  const { mutate } = useSWRConfig();

  return useCallback(() => {
    invalidateParameterizedKey(mutate, getClassesControllerFindAllV0Url);
  }, [mutate]);
};
