import { classesControllerCreateV0 } from "../../generated/endpoints/classes/classes";
import { useCallback } from "react";
import { ExistingClass } from "../../models/classes/existing-class";
import { useRevalidateClassList } from "./useRevalidateClassList";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { CreateClassDto } from "../../generated/models";

type CreateClassType = (
  createClassDto: CreateClassDto,
) => Promise<ExistingClass>;

const createAndTransform = (
  options: RequestInit,
  createClassDto: CreateClassDto,
): ReturnType<CreateClassType> =>
  classesControllerCreateV0(createClassDto, options).then(
    ExistingClass.fromDto,
  );

export const useCreateClass = (): CreateClassType => {
  const authOptions = useAuthenticationOptions();
  const revalidateClassList = useRevalidateClassList();

  return useCallback<CreateClassType>(
    (dto) =>
      createAndTransform(authOptions, dto).then((result) => {
        revalidateClassList();

        return result;
      }),
    [authOptions, revalidateClassList],
  );
};
