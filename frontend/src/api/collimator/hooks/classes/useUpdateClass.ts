import {
  classesControllerUpdate,
  getClassesControllerFindOneUrl,
} from "../../generated/endpoints/classes/classes";
import { fromDto } from "../helpers";
import { useCallback } from "react";
import { ExistingClass } from "../../models/classes/existing-class";
import { useSWRConfig } from "swr";

type Args = Parameters<typeof classesControllerUpdate>;
type UpdateClassType = (...args: Args) => Promise<ExistingClass>;

const fetchAndTransform: UpdateClassType = (...args) =>
  classesControllerUpdate(...args).then((data) => fromDto(ExistingClass, data));

export const useUpdateClass = (): UpdateClassType => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        // revalidate the updated class
        mutate(getClassesControllerFindOneUrl(result.id));

        return result;
      }),
    [mutate],
  );
};
