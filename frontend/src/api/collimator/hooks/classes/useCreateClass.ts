import {
  classesControllerCreate,
  getClassesControllerFindOneUrl,
} from "../../generated/endpoints/classes/classes";
import { useCallback } from "react";
import { ExistingClass } from "../../models/classes/existing-class";
import { useSWRConfig } from "swr";

type Args = Parameters<typeof classesControllerCreate>;
type CreateClassType = (...args: Args) => Promise<ExistingClass>;

const createAndTransform: CreateClassType = (...args) =>
  classesControllerCreate(...args).then(ExistingClass.fromDto);

export const useCreateClass = (): CreateClassType => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      createAndTransform(...args).then((result) => {
        // revalidate the updated class
        mutate(getClassesControllerFindOneUrl(result.id));

        return result;
      }),
    [mutate],
  );
};
