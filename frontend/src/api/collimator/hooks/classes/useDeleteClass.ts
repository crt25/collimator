import { useCallback } from "react";
import {
  classesControllerRemoveV0,
  getClassesControllerFindAllV0Url,
} from "../../generated/endpoints/classes/classes";
import { DeletedClass } from "../../models/classes/deleted-class";
import { useSWRConfig } from "swr";

type Args = Parameters<typeof classesControllerRemoveV0>;
type DeleteClassType = (...args: Args) => Promise<DeletedClass>;

const fetchAndTransform: DeleteClassType = (...args) =>
  classesControllerRemoveV0(...args).then(DeletedClass.fromDto);

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
            key[0].startsWith(getClassesControllerFindAllV0Url())
          );
        });

        return result;
      }),
    [mutate],
  );
};
