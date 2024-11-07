import { useCallback } from "react";
import { ExistingUser } from "../../models/users/existing-user";
import {
  getUsersControllerFindOneV0Url,
  usersControllerCreateV0,
} from "../../generated/endpoints/users/users";
import { useSWRConfig } from "swr";
import { GetUserReturnType } from "./useUser";

type Args = Parameters<typeof usersControllerCreateV0>;
type CreateUserType = (...args: Args) => Promise<ExistingUser>;

const createAndTransform: CreateUserType = (...args) =>
  usersControllerCreateV0(...args).then(ExistingUser.fromDto);

export const useCreateUser = (): CreateUserType => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      createAndTransform(...args).then((result) => {
        // store the created user in the cache
        const getUsersControllerFindResponse: GetUserReturnType = result;

        mutate(
          getUsersControllerFindOneV0Url(result.id),
          getUsersControllerFindResponse,
        );

        return result;
      }),
    [mutate],
  );
};
