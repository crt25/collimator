import { useCallback } from "react";
import { useSWRConfig } from "swr";
import {
  getUsersControllerFindOneV0Url,
  usersControllerUpdateV0,
} from "../../generated/endpoints/users/users";
import { ExistingUser } from "../../models/users/existing-user";
import { GetUserReturnType } from "./useUser";

type Args = Parameters<typeof usersControllerUpdateV0>;
type UpdateUserType = (...args: Args) => Promise<ExistingUser>;

const fetchAndTransform: UpdateUserType = (...args) =>
  usersControllerUpdateV0(...args).then(ExistingUser.fromDto);

export const useUpdateUser = (): UpdateUserType => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        // store the created user in the cache
        const getUsersControllerFindOneResponse: GetUserReturnType = result;

        mutate(
          getUsersControllerFindOneV0Url(result.id),
          getUsersControllerFindOneResponse,
        );

        return result;
      }),
    [mutate],
  );
};
