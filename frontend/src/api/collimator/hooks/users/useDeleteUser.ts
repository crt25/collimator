import { useCallback } from "react";
import { usersControllerDeleteV0 } from "../../generated/endpoints/users/users";
import { DeletedUser } from "../../models/users/deleted-user";
import { useRevalidateUserList } from "./useRevalidateUserList";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";

type DeleteUserType = (id: number) => Promise<DeletedUser>;

const fetchAndTransform = (
  options: RequestInit,
  id: number,
): ReturnType<DeleteUserType> =>
  usersControllerDeleteV0(id, options).then(DeletedUser.fromDto);

export const useDeleteUser = (): DeleteUserType => {
  const authOptions = useAuthenticationOptions();
  const revalidateUserList = useRevalidateUserList();

  return useCallback(
    (id) =>
      fetchAndTransform(authOptions, id).then((result) => {
        revalidateUserList();

        return result;
      }),
    [authOptions, revalidateUserList],
  );
};
