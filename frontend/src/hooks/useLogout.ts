import { useRouter } from "next/router";
import { useCallback, useContext } from "react";
import { useSWRConfig } from "swr";
import { UpdateAuthenticationContext } from "@/contexts/UpdateAuthenticationContext";
import { authenticationContextDefaultValue } from "@/contexts/AuthenticationContext";

export const useLogout = (): (() => void) => {
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const updateAuthenticationContext = useContext(UpdateAuthenticationContext);

  return useCallback(() => {
    updateAuthenticationContext(authenticationContextDefaultValue);

    // Invalidate all SWR caches
    mutate(() => true);

    router.push("/login");
  }, [mutate, updateAuthenticationContext, router]);
};
