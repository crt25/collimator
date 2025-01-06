import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { ExistingClass } from "../../models/classes/existing-class";
import {
  classesControllerUpdateV0,
  getClassesControllerFindOneV0Url,
} from "../../generated/endpoints/classes/classes";
import { ExistingClassExtended } from "../../models/classes/existing-class-extended";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { UpdateClassDto } from "../../generated/models";
import { GetClassReturnType } from "./useClass";
import { useRevalidateClassList } from "./useRevalidateClassList";

type UpdateClassType = (
  id: number,
  updateClassDto: UpdateClassDto,
) => Promise<ExistingClass>;

const fetchAndTransform = (
  options: RequestInit,
  id: number,
  updateClassDto: UpdateClassDto,
): ReturnType<UpdateClassType> =>
  classesControllerUpdateV0(id, updateClassDto, options).then(
    ExistingClass.fromDto,
  );

export const useUpdateClass = (): UpdateClassType => {
  const authOptions = useAuthenticationOptions();
  const { mutate, cache } = useSWRConfig();
  const revalidateClassList = useRevalidateClassList();

  return useCallback<UpdateClassType>(
    (id, updateClassDto) =>
      fetchAndTransform(authOptions, id, updateClassDto).then((result) => {
        // revalidate the updated class

        const cachedData: GetClassReturnType | undefined = cache.get(
          getClassesControllerFindOneV0Url(result.id),
        )?.data;

        if (cachedData === undefined) {
          mutate(getClassesControllerFindOneV0Url(result.id));

          return result;
        }

        // perform an optimistic partial update but also revalidate the data
        // to make sure it's up to date (for instance we don't have enough information to update the teacher)
        const updatedData: GetClassReturnType = ExistingClassExtended.fromDto({
          ...cachedData,
          ...result,
        });

        mutate(getClassesControllerFindOneV0Url(result.id), updatedData, {
          revalidate: true,
        });

        // revalidate the class list
        revalidateClassList();

        return result;
      }),
    [authOptions, mutate, cache, revalidateClassList],
  );
};
