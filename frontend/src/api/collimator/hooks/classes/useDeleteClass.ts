import { useCallback } from "react";
import { classesControllerRemoveV0 } from "../../generated/endpoints/classes/classes";
import { DeletedClass } from "../../models/classes/deleted-class";
import { useRevalidateClassList } from "./useRevalidateClassList";

type Args = Parameters<typeof classesControllerRemoveV0>;
type DeleteClassType = (...args: Args) => Promise<DeletedClass>;

const fetchAndTransform: DeleteClassType = (...args) =>
  classesControllerRemoveV0(...args).then(DeletedClass.fromDto);

export const useDeleteClass = (): DeleteClassType => {
  const revalidateClassList = useRevalidateClassList();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        revalidateClassList();

        return result;
      }),
    [revalidateClassList],
  );
};
