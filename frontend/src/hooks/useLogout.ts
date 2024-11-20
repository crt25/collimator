import { authenticationContextDefaultValue } from "@/contexts/AuthenticationContext";
import { UpdateAuthenticationContext } from "@/contexts/UpdateAuthenticationContext";
import { useRouter } from "next/router";
import { useCallback, useContext } from "react";
import { useSWRConfig } from "swr";

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
