import { useContext, useEffect } from "react";
import {
  AuthenticationContext,
  isFullyAuthenticated,
} from "@/contexts/AuthenticationContext";
import { usersControllerFindOneV0 } from "@/api/collimator/generated/endpoints/users/users";
import { useAuthenticationOptions } from "@/api/collimator/hooks/authentication/useAuthenticationOptions";
import { UserRole } from "@/types/user/user-role";

const POLLING_INTERVAL_MS = 1000 * 60 * 5; // 5 minutes

export const useAuthExpirationCheck = (): void => {
  const context = useContext(AuthenticationContext);
  const authOptions = useAuthenticationOptions();

  useEffect(() => {
    if (!isFullyAuthenticated(context)) {
      return;
    }

    // we only check for authentication expiration for non-student users, as students have a different authentication flow
    if (context.role === UserRole.student) {
      return;
    }

    const userId = context.userId;

    function checkAuthenticationExpiration(): void {
      usersControllerFindOneV0(userId, authOptions).catch((error) => {
        console.error(
          "[useAuthExpirationCheck] Error while checking authentication expiration",
          error,
        );
      });
    }

    checkAuthenticationExpiration();

    const intervalId = setInterval(() => {
      checkAuthenticationExpiration();
    }, POLLING_INTERVAL_MS);

    return (): void => {
      clearInterval(intervalId);
    };
  }, [authOptions, context]);
};
