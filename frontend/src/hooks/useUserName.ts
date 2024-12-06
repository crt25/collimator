import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { useContext } from "react";

export const useUserName = (): string | undefined => {
  const context = useContext(AuthenticationContext);
  return "name" in context ? context.name : undefined;
};
