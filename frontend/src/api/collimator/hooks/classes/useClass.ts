import useSWR from "swr";
import {
  classesControllerFindOne,
  getClassesControllerFindOneUrl,
} from "../../generated/endpoints/classes/classes";
import { ApiResponse } from "../helpers";
import { ExistingClassExtended } from "../../models/classes/existing-class-extended";

export type GetClassReturnType = ExistingClassExtended;

const fetchAndTransform = (id: number): Promise<GetClassReturnType> =>
  classesControllerFindOne(id).then(ExistingClassExtended.fromDto);

export const useClass = (
  id: number | string,
): ApiResponse<GetClassReturnType, Error> => {
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;

  return useSWR(getClassesControllerFindOneUrl(numericId), () =>
    isNaN(numericId)
      ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
        new Promise<GetClassReturnType>(() => {})
      : fetchAndTransform(numericId),
  );
};
