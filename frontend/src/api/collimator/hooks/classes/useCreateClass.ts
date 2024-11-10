import {
  classesControllerCreateV0,
  getClassesControllerFindOneV0Url,
} from "../../generated/endpoints/classes/classes";
import { useCallback } from "react";
import { ExistingClass } from "../../models/classes/existing-class";
import { useSWRConfig } from "swr";

type Args = Parameters<typeof classesControllerCreateV0>;
type CreateClassType = (...args: Args) => Promise<ExistingClass>;

const createAndTransform: CreateClassType = (...args) =>
  classesControllerCreateV0(...args).then(ExistingClass.fromDto);

export const useCreateClass = (): CreateClassType => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      createAndTransform(...args).then((result) => {
        // revalidate the updated class
        mutate(getClassesControllerFindOneV0Url(result.id));

        return result;
      }),
    [mutate],
  );
};
