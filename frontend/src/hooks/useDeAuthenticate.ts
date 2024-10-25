import { UpdateAuthenticationContext } from "@/contexts/UpdateAuthenticationContext";
import { useRouter } from "next/router";
import { useCallback, useContext } from "react";

export const useDeAuthenticate = (): (() => void) => {
  const router = useRouter();
  const updateAuthenticationContext = useContext(UpdateAuthenticationContext);

  return useCallback(() => {
    updateAuthenticationContext({
      version: "1",
      role: undefined,
      idToken: undefined,
      authenticationToken: undefined,
    });

    router.push("/login");
  }, [updateAuthenticationContext, router]);
};
