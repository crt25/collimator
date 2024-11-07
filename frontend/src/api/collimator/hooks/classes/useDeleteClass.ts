import { useCallback } from "react";
import {
  classesControllerRemove,
  getClassesControllerFindAllUrl,
} from "../../generated/endpoints/classes/classes";
import { DeletedClass } from "../../models/classes/deleted-class";
import { useSWRConfig } from "swr";

type Args = Parameters<typeof classesControllerRemove>;
type DeleteClassType = (...args: Args) => Promise<DeletedClass>;

const fetchAndTransform: DeleteClassType = (...args) =>
  classesControllerRemove(...args).then(DeletedClass.fromDto);

export const useDeleteClass = (): DeleteClassType => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        // Invalidate the cache for the class list
        mutate((key) => {
          return (
            Array.isArray(key) &&
            key.length >= 1 &&
            typeof key[0] === "string" &&
            key[0].startsWith(getClassesControllerFindAllUrl())
          );
        });

        return result;
      }),
    [mutate],
  );
};
