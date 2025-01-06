import { useContext } from "react";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";

export const useIsAuthenticated = (): boolean => {
  const authContext = useContext(AuthenticationContext);

  return authContext.authenticationToken !== undefined;
};
