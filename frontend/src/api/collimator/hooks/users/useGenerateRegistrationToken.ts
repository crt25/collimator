import { useCallback } from "react";
import { usersControllerCreateRegistrationTokenV0 } from "../../generated/endpoints/users/users";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";

type GenerateRegistrationToken = (userId: number) => Promise<string>;

const createAndTransform = (
  options: RequestInit,
  userId: number,
): ReturnType<GenerateRegistrationToken> =>
  usersControllerCreateRegistrationTokenV0(userId, options).then(
    (dto) => dto.token,
  );

export const useGenerateRegistrationToken = (): GenerateRegistrationToken => {
  const authOptions = useAuthenticationOptions();

  return useCallback(
    (userId: number) => createAndTransform(authOptions, userId),
    [authOptions],
  );
};
