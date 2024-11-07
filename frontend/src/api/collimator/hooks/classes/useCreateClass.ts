import { classesControllerCreate } from "../../generated/endpoints/classes/classes";
import { useCallback } from "react";
import { ExistingClass } from "../../models/classes/existing-class";

type Args = Parameters<typeof classesControllerCreate>;
type CreateClassType = (...args: Args) => Promise<ExistingClass>;

const createAndTransform: CreateClassType = (...args) =>
  classesControllerCreate(...args).then(ExistingClass.fromDto);

export const useCreateClass = (): CreateClassType =>
  useCallback((...args: Args) => createAndTransform(...args).then(), []);
