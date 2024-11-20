import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { useContext, useMemo } from "react";

export const useAuthenticationOptions = (): RequestInit => {
  const authContext = useContext(AuthenticationContext);

  return useMemo<RequestInit>(
    () => ({
      headers: {
        Authorization: `Bearer ${authContext.authenticationToken}`,
      },
    }),
    [authContext.authenticationToken],
  );
};
