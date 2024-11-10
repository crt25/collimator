import {
  classesControllerUpdateV0,
  getClassesControllerFindOneV0Url,
} from "../../generated/endpoints/classes/classes";
import { useCallback } from "react";
import { ExistingClass } from "../../models/classes/existing-class";
import { useSWRConfig } from "swr";

type Args = Parameters<typeof classesControllerUpdateV0>;
type UpdateClassType = (...args: Args) => Promise<ExistingClass>;

const fetchAndTransform: UpdateClassType = (...args) =>
  classesControllerUpdateV0(...args).then(ExistingClass.fromDto);

export const useUpdateClass = (): UpdateClassType => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        // revalidate the updated class
        mutate(getClassesControllerFindOneV0Url(result.id));

        return result;
      }),
    [mutate],
  );
};
