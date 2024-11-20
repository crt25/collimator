import { useCallback } from "react";
import { authenticationControllerLoginV0 } from "../../generated/endpoints/authentication/authentication";
import { AuthenticationResponseDto } from "../../generated/models";

type Args = Parameters<typeof authenticationControllerLoginV0>;
type AuthenticateUserType = (
  ...args: Args
) => Promise<AuthenticationResponseDto>;

const fetchAndTransform: AuthenticateUserType = (...args) =>
  authenticationControllerLoginV0(...args);

export const useAuthenticateUser = (): AuthenticateUserType => {
  return useCallback((...args: Args) => fetchAndTransform(...args), []);
};
