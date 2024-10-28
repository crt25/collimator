import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { useContext } from "react";

export const useUserEmail = (): string | undefined => {
  const context = useContext(AuthenticationContext);
  return "email" in context ? context.email : undefined;
};
