import { useCallback } from "react";
import { usersControllerDeleteV0 } from "../../generated/endpoints/users/users";
import { DeletedUser } from "../../models/users/deleted-user";
import { useRevalidateUserList } from "./useRevalidateUserList";

type Args = Parameters<typeof usersControllerDeleteV0>;
type DeleteUserType = (...args: Args) => Promise<DeletedUser>;

const fetchAndTransform: DeleteUserType = (...args) =>
  usersControllerDeleteV0(...args).then(DeletedUser.fromDto);

export const useDeleteUser = (): DeleteUserType => {
  const revalidateUserList = useRevalidateUserList();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        revalidateUserList();

        return result;
      }),
    [revalidateUserList],
  );
};
