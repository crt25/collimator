import { useCallback } from "react";
import { authenticationControllerWebsocketTokenV0 } from "../../generated/endpoints/authentication/authentication";
import { useAuthenticationOptions } from "./useAuthenticationOptions";

type TReturn = Promise<string>;

const fetchAndTransform = (options: RequestInit): TReturn =>
  authenticationControllerWebsocketTokenV0(options).then(
    (response) => response.token,
  );

export const useRequestWebsocketToken = (): (() => TReturn) => {
  const authOptions = useAuthenticationOptions();

  return useCallback(() => fetchAndTransform(authOptions), [authOptions]);
};
