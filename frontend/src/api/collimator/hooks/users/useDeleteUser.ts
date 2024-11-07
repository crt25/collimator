import { useCallback } from "react";
import {
  getUsersControllerFindAllUrl,
  usersControllerDelete,
} from "../../generated/endpoints/users/users";
import { DeletedUser } from "../../models/users/deleted-user";
import { useSWRConfig } from "swr";

type Args = Parameters<typeof usersControllerDelete>;
type DeleteUserType = (...args: Args) => Promise<DeletedUser>;

const fetchAndTransform: DeleteUserType = (...args) =>
  usersControllerDelete(...args).then(DeletedUser.fromDto);

export const useDeleteUser = (): DeleteUserType => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        // Invalidate the cache for the user list
        mutate((key) => {
          return (
            Array.isArray(key) &&
            key.length >= 1 &&
            typeof key[0] === "string" &&
            key[0].startsWith(getUsersControllerFindAllUrl())
          );
        });

        return result;
      }),
    [mutate],
  );
};
