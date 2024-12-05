import useSWR from "swr";
import {
  classesControllerFindOneV0,
  getClassesControllerFindOneV0Url,
} from "../../generated/endpoints/classes/classes";
import { ApiResponse, getIdOrNaN } from "../helpers";
import { ExistingClassExtended } from "../../models/classes/existing-class-extended";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";

export type GetClassReturnType = ExistingClassExtended;

export const fetchSingleClassAndTransform = (
  options: RequestInit,
  id: number,
): Promise<GetClassReturnType> =>
  classesControllerFindOneV0(id, options).then(ExistingClassExtended.fromDto);

export const useClass = (
  id?: number | string,
): ApiResponse<GetClassReturnType, Error> => {
  const numericId = getIdOrNaN(id);
  const authOptions = useAuthenticationOptions();

  return useSWR(getClassesControllerFindOneV0Url(numericId), () =>
    isNaN(numericId)
      ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
        new Promise<GetClassReturnType>(() => {})
      : fetchSingleClassAndTransform(authOptions, numericId),
  );
};
