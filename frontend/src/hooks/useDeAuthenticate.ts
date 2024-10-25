import { authenticationContextDefaultValue } from "@/contexts/AuthenticationContext";
import { UpdateAuthenticationContext } from "@/contexts/UpdateAuthenticationContext";
import { useRouter } from "next/router";
import { useCallback, useContext } from "react";

export const useDeAuthenticate = (): (() => void) => {
  const router = useRouter();
  const updateAuthenticationContext = useContext(UpdateAuthenticationContext);

  return useCallback(() => {
    updateAuthenticationContext(authenticationContextDefaultValue);

    router.push("/login");
  }, [updateAuthenticationContext, router]);
};
