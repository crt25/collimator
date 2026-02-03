import useSWR from "swr";
import {
  classesControllerFindOneV0,
  getClassesControllerFindOneV0Url,
} from "../../generated/endpoints/classes/classes";
import { ApiResponse, getIdOrNaN } from "../helpers";
import { ExistingClassExtended } from "../../models/classes/existing-class-extended";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { ClassesControllerFindOneV0Params } from "../../generated/models";

export type GetClassReturnType = ExistingClassExtended;

const defaultParams: ClassesControllerFindOneV0Params = {};

export const fetchSingleClassAndTransform = (
  options: RequestInit,
  id: number,
  params: ClassesControllerFindOneV0Params = defaultParams,
): Promise<GetClassReturnType> =>
  classesControllerFindOneV0(id, params, options).then(
    ExistingClassExtended.fromDto,
  );

export const useClass = (
  id?: number | string,
  params: ClassesControllerFindOneV0Params = defaultParams,
): ApiResponse<GetClassReturnType, Error> => {
  const numericId = getIdOrNaN(id);
  const authOptions = useAuthenticationOptions();

  return useSWR(getClassesControllerFindOneV0Url(numericId, params), () =>
    isNaN(numericId)
      ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
        new Promise<GetClassReturnType>(() => {})
      : fetchSingleClassAndTransform(authOptions, numericId, params),
  );
};
