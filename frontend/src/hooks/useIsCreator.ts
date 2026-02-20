import { useContext } from "react";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";

export const useIsCreator = (creatorId: number | undefined): boolean => {
  const authContext = useContext(AuthenticationContext);

  return (
    authContext.role !== undefined &&
    "userId" in authContext &&
    authContext.userId === creatorId
  );
};
