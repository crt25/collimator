import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { useContext } from "react";

export const useIsAuthenticated = (): boolean => {
  const authContext = useContext(AuthenticationContext);

  return authContext.authenticationToken !== undefined;
};
