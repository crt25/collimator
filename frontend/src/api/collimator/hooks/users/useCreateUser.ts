import { useCallback } from "react";
import { ExistingUser } from "../../models/users/existing-user";
import { usersControllerCreateV0 } from "../../generated/endpoints/users/users";
import { useRevalidateUserList } from "./useRevalidateUserList";
import { useRevalidateUser } from "./useRevalidateUser";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { CreateUserDto } from "../../generated/models";

type CreateUserType = (createUserDto: CreateUserDto) => Promise<ExistingUser>;

const createAndTransform = (
  options: RequestInit,
  createUserDto: CreateUserDto,
): ReturnType<CreateUserType> =>
  usersControllerCreateV0(createUserDto, options).then(ExistingUser.fromDto);

export const useCreateUser = (): CreateUserType => {
  const authOptions = useAuthenticationOptions();
  const revalidateUser = useRevalidateUser();
  const revalidateUserList = useRevalidateUserList();

  return useCallback(
    (createUserDto: CreateUserDto) =>
      createAndTransform(authOptions, createUserDto).then((result) => {
        revalidateUser(result.id, result);
        revalidateUserList();

        return result;
      }),
    [authOptions, revalidateUser, revalidateUserList],
  );
};
