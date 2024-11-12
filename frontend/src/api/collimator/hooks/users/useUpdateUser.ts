import { useCallback } from "react";
import { usersControllerUpdateV0 } from "../../generated/endpoints/users/users";
import { ExistingUser } from "../../models/users/existing-user";
import { useRevalidateUserList } from "./useRevalidateUserList";
import { useRevalidateUser } from "./useRevalidateUser";

type Args = Parameters<typeof usersControllerUpdateV0>;
type UpdateUserType = (...args: Args) => Promise<ExistingUser>;

const fetchAndTransform: UpdateUserType = (...args) =>
  usersControllerUpdateV0(...args).then(ExistingUser.fromDto);

export const useUpdateUser = (): UpdateUserType => {
  const revalidateUser = useRevalidateUser();
  const revalidateUserList = useRevalidateUserList();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        revalidateUser(result.id, result);
        revalidateUserList();

        return result;
      }),
    [revalidateUser, revalidateUserList],
  );
};
