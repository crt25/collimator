import { useCallback } from "react";
import { ExistingUser } from "../../models/users/existing-user";
import {
  getUsersControllerFindOneUrl,
  usersControllerCreate,
} from "../../generated/endpoints/users/users";
import { useSWRConfig } from "swr";
import { GetUserReturnType } from "./useUser";

type Args = Parameters<typeof usersControllerCreate>;
type CreateUserType = (...args: Args) => Promise<ExistingUser>;

const createAndTransform: CreateUserType = (...args) =>
  usersControllerCreate(...args).then(ExistingUser.fromDto);

export const useCreateUser = (): CreateUserType => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (...args: Args) =>
      createAndTransform(...args).then((result) => {
        // store the created user in the cache
        const getUsersControllerFindResponse: GetUserReturnType = result;

        mutate(
          getUsersControllerFindOneUrl(result.id),
          getUsersControllerFindResponse,
        );

        return result;
      }),
    [mutate],
  );
};
