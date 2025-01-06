import { useContext } from "react";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";

export const useUserName = (): string | undefined => {
  const context = useContext(AuthenticationContext);
  return "name" in context ? context.name : undefined;
};
