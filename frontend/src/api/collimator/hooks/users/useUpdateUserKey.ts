import { useCallback } from "react";
import { usersControllerUpdateKeyV0 } from "../../generated/endpoints/users/users";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { UpdateUserKeyDto } from "../../generated/models";

type UpdateUserType = (
  id: number,
  updateUserKeyDto: UpdateUserKeyDto,
  authToken?: string,
) => Promise<number>;

const fetchAndTransform = (
  options: RequestInit,
  id: number,
  updateUserKeyDto: UpdateUserKeyDto,
): ReturnType<UpdateUserType> =>
  usersControllerUpdateKeyV0(id, updateUserKeyDto, options);

export const useUpdateUserKey = (): UpdateUserType => {
  const authOptions = useAuthenticationOptions();

  return useCallback(
    (id, updateUserKeyDto, authToken) =>
      fetchAndTransform(
        authToken
          ? {
              // we allow passing the auth token manually since this function is used durig the login process
              // and before the authentication context is set up
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          : authOptions,
        id,
        updateUserKeyDto,
      ),
    [authOptions],
  );
};
