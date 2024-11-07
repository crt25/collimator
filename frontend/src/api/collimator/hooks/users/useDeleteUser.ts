import { useCallback } from "react";
import {
  getUsersControllerFindAllV0Url,
  usersControllerDeleteV0,
} from "../../generated/endpoints/users/users";
import { DeletedUser } from "../../models/users/deleted-user";
import { useSWRConfig } from "swr";

type Args = Parameters<typeof usersControllerDeleteV0>;
type DeleteUserType = (...args: Args) => Promise<DeletedUser>;

const fetchAndTransform: DeleteUserType = (...args) =>
  usersControllerDeleteV0(...args).then(DeletedUser.fromDto);

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
            key[0].startsWith(getUsersControllerFindAllV0Url())
          );
        });

        return result;
      }),
    [mutate],
  );
};
