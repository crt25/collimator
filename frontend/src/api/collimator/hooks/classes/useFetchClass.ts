import { useCallback } from "react";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { fetchSingleClassAndTransform, GetClassReturnType } from "./useClass";

export const useFetchClass = (): ((
  classId: number,
) => Promise<GetClassReturnType>) => {
  const authOptions = useAuthenticationOptions();

  return useCallback(
    (classId) => fetchSingleClassAndTransform(authOptions, classId),
    [authOptions],
  );
};
