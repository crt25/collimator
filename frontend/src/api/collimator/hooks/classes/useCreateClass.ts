import { classesControllerCreateV0 } from "../../generated/endpoints/classes/classes";
import { useCallback } from "react";
import { ExistingClass } from "../../models/classes/existing-class";
import { useRevalidateClassList } from "./useRevalidateClassList";

type Args = Parameters<typeof classesControllerCreateV0>;
type CreateClassType = (...args: Args) => Promise<ExistingClass>;

const createAndTransform: CreateClassType = (...args) =>
  classesControllerCreateV0(...args).then(ExistingClass.fromDto);

export const useCreateClass = (): CreateClassType => {
  const revalidateClassList = useRevalidateClassList();

  return useCallback(
    (...args: Args) =>
      createAndTransform(...args).then((result) => {
        revalidateClassList();

        return result;
      }),
    [revalidateClassList],
  );
};
