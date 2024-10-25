import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { useContext } from "react";

export const useUserEmail = (): string | undefined =>
  useContext(AuthenticationContext).email;
