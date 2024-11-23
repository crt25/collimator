import {
  classesControllerUpdateV0,
  getClassesControllerFindOneV0Url,
} from "../../generated/endpoints/classes/classes";
import { useCallback } from "react";
import { ExistingClass } from "../../models/classes/existing-class";
import { useSWRConfig } from "swr";
import { GetClassReturnType } from "./useClass";
import { ExistingClassExtended } from "../../models/classes/existing-class-extended";
import { useRevalidateClassList } from "./useRevalidateClassList";

type Args = Parameters<typeof classesControllerUpdateV0>;
type UpdateClassType = (...args: Args) => Promise<ExistingClass>;

const fetchAndTransform: UpdateClassType = (...args) =>
  classesControllerUpdateV0(...args).then(ExistingClass.fromDto);

export const useUpdateClass = (): UpdateClassType => {
  const { mutate, cache } = useSWRConfig();
  const revalidateClassList = useRevalidateClassList();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
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
    [mutate, cache, revalidateClassList],
  );
};
