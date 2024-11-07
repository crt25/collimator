import { useCallback } from "react";
import { useSWRConfig } from "swr";
import {
  getUsersControllerFindOneUrl,
  usersControllerUpdate,
} from "../../generated/endpoints/users/users";
import { ExistingUser } from "../../models/users/existing-user";
import { GetUserReturnType } from "./useUser";

type Args = Parameters<typeof usersControllerUpdate>;
type UpdateUserType = (...args: Args) => Promise<ExistingUser>;

const fetchAndTransform: UpdateUserType = (...args) =>
  usersControllerUpdate(...args).then(ExistingUser.fromDto);

export const useUpdateUser = (): UpdateUserType => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        // store the created user in the cache
        const getUsersControllerFindOneResponse: GetUserReturnType = result;

        mutate(
          getUsersControllerFindOneUrl(result.id),
          getUsersControllerFindOneResponse,
        );

        return result;
      }),
    [mutate],
  );
};
