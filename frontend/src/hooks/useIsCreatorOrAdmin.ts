import { useContext } from "react";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { UserRole } from "@/types/user/user-role";

export const useIsCreatorOrAdmin = (creatorId: number | undefined): boolean => {
  const authContext = useContext(AuthenticationContext);

  return (
    authContext.role !== undefined &&
    "userId" in authContext &&
    (authContext.userId === creatorId || authContext.role === UserRole.admin)
  );
};
