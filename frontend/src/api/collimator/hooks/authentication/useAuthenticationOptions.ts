import { useContext, useMemo } from "react";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";

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
