import useSWR from "swr";
import {
  classesControllerFindAllV0,
  getClassesControllerFindAllV0Url,
} from "../../generated/endpoints/classes/classes";
import { ApiResponse, fromDtos } from "../helpers";
import { ExistingClassWithTeacher } from "../../models/classes/existing-class-with-teacher";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";

export type GetClassesReturnType = ExistingClassWithTeacher[];

const fetchAndTransform = (
  options: RequestInit,
): Promise<GetClassesReturnType> =>
  classesControllerFindAllV0({}, options).then((data) =>
    fromDtos(ExistingClassWithTeacher, data),
  );

export const useAllClasses = (): ApiResponse<GetClassesReturnType, Error> => {
  const authOptions = useAuthenticationOptions();

  return useSWR(
    // use the URL with the params as the first entry in the key for easier invalidation
    getClassesControllerFindAllV0Url,
    () => fetchAndTransform(authOptions),
  );
};
