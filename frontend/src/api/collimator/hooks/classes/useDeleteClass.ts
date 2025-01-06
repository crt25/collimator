import { useCallback } from "react";
import { classesControllerRemoveV0 } from "../../generated/endpoints/classes/classes";
import { DeletedClass } from "../../models/classes/deleted-class";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { useRevalidateClassList } from "./useRevalidateClassList";

type DeleteClassType = (id: number) => Promise<DeletedClass>;

const fetchAndTransform = (
  options: RequestInit,
  id: number,
): ReturnType<DeleteClassType> =>
  classesControllerRemoveV0(id, options).then(DeletedClass.fromDto);

export const useDeleteClass = (): DeleteClassType => {
  const authOptions = useAuthenticationOptions();
  const revalidateClassList = useRevalidateClassList();

  return useCallback<DeleteClassType>(
    (id) =>
      fetchAndTransform(authOptions, id).then((result) => {
        revalidateClassList();

        return result;
      }),
    [authOptions, revalidateClassList],
  );
};
