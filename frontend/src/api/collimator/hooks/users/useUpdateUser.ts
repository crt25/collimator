import { useCallback } from "react";
import { usersControllerUpdateV0 } from "../../generated/endpoints/users/users";
import { ExistingUser } from "../../models/users/existing-user";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import {
  UpdateUserDto,
  UsersControllerUpdateV0Params,
} from "../../generated/models";
import { useRevalidateUserList } from "./useRevalidateUserList";
import { useRevalidateUser } from "./useRevalidateUser";

const defaultParams: UsersControllerUpdateV0Params = {};

type UpdateUserType = (
  id: number,
  updateUserDto: UpdateUserDto,
  authToken?: string,
) => Promise<ExistingUser>;

const fetchAndTransform = (
  options: RequestInit,
  id: number,
  updateUserDto: UpdateUserDto,
  params: UsersControllerUpdateV0Params = defaultParams,
): ReturnType<UpdateUserType> =>
  usersControllerUpdateV0(id, updateUserDto, params, options).then(
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
