import {
  classesControllerUpdate,
  getClassesControllerFindOneUrl,
} from "../../generated/endpoints/classes/classes";
import { useCallback } from "react";
import { ExistingClass } from "../../models/classes/existing-class";
import { useSWRConfig } from "swr";
import { GetClassReturnType } from "./useClass";
import { ExistingClassExtended } from "../../models/classes/existing-class-extended";

type Args = Parameters<typeof classesControllerUpdate>;
type UpdateClassType = (...args: Args) => Promise<ExistingClass>;

const fetchAndTransform: UpdateClassType = (...args) =>
  classesControllerUpdate(...args).then(ExistingClass.fromDto);

export const useUpdateClass = (): UpdateClassType => {
  const { mutate, cache } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        // revalidate the updated class

        const cachedData: GetClassReturnType | undefined = cache.get(
          getClassesControllerFindOneUrl(result.id),
        )?.data;

        if (cachedData === undefined) {
          mutate(getClassesControllerFindOneUrl(result.id));

          return result;
        }

        // perform an optimistic partial update but also revalidate the data
        // to make sure it's up to date (for instance we don't have enough information to update the teacher)
        const updatedData: GetClassReturnType = ExistingClassExtended.fromDto({
          ...cachedData,
          ...result,
        });

        mutate(getClassesControllerFindOneUrl(result.id), updatedData, {
          revalidate: true,
        });

        return result;
      }),
    [mutate, cache],
  );
};
