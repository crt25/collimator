import useSWR from "swr";
import {
  classesControllerFindOne,
  getClassesControllerFindOneUrl,
} from "../../generated/endpoints/classes/classes";
import { ApiResponse, fromDto } from "../helpers";
import { ExistingClassExtended } from "../../models/classes/existing-class-extended";

const fetchAndTransform = (id: number): Promise<ExistingClassExtended> =>
  classesControllerFindOne(id).then((data) =>
    fromDto(ExistingClassExtended, data),
  );

export const useClass = (
  id: number | string,
): ApiResponse<ExistingClassExtended, Error> => {
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;

  return useSWR(getClassesControllerFindOneUrl(numericId), () =>
    isNaN(numericId) ? Promise.reject() : fetchAndTransform(numericId),
  );
};
