import { useCallback } from "react";
import { usersControllerUpdateV0 } from "../../generated/endpoints/users/users";
import { ExistingUser } from "../../models/users/existing-user";
import { useRevalidateUserList } from "./useRevalidateUserList";
import { useRevalidateUser } from "./useRevalidateUser";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { UpdateUserDto } from "../../generated/models";

type UpdateUserType = (
  id: number,
  updateUserDto: UpdateUserDto,
  authToken?: string,
) => Promise<ExistingUser>;

const fetchAndTransform = (
  options: RequestInit,
  id: number,
  updateUserDto: UpdateUserDto,
): ReturnType<UpdateUserType> =>
  usersControllerUpdateV0(id, updateUserDto, options).then(
    ExistingUser.fromDto,
  );

export const useUpdateUser = (): UpdateUserType => {
  const authOptions = useAuthenticationOptions();
  const revalidateUser = useRevalidateUser();
  const revalidateUserList = useRevalidateUserList();

  return useCallback(
    (id, updateUserDto) =>
      fetchAndTransform(authOptions, id, updateUserDto).then((result) => {
        revalidateUser(result.id, result);
        revalidateUserList();

        return result;
      }),
    [authOptions, revalidateUser, revalidateUserList],
  );
};
