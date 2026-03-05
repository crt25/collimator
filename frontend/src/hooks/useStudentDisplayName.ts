import { useContext } from "react";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { UserRole } from "@/types/user/user-role";

export const useStudentDisplayName = (): string => {
  const authenticationContext = useContext(AuthenticationContext);

  if (
    !authenticationContext ||
    authenticationContext.role !== UserRole.student
  ) {
    throw new Error(
      "useStudentDisplayName can only be used in student authentication context",
    );
  }

  if (!("name" in authenticationContext) || !authenticationContext.name) {
    throw new Error("Student name not available in authentication context");
  }

  return authenticationContext.name;
};
