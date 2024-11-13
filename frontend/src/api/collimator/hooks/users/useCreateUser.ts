import { useCallback } from "react";
import { ExistingUser } from "../../models/users/existing-user";
import { usersControllerCreateV0 } from "../../generated/endpoints/users/users";
import { useRevalidateUserList } from "./useRevalidateUserList";
import { useRevalidateUser } from "./useRevalidateUser";

type Args = Parameters<typeof usersControllerCreateV0>;
type CreateUserType = (...args: Args) => Promise<ExistingUser>;

const createAndTransform: CreateUserType = (...args) =>
  usersControllerCreateV0(...args).then(ExistingUser.fromDto);

export const useCreateUser = (): CreateUserType => {
  const revalidateUser = useRevalidateUser();
  const revalidateUserList = useRevalidateUserList();

  return useCallback(
    (...args: Args) =>
      createAndTransform(...args).then((result) => {
        revalidateUser(result.id, result);
        revalidateUserList();

        return result;
      }),
    [revalidateUser, revalidateUserList],
  );
};
