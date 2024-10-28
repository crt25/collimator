import { createContext } from "react";
import { AuthenticationContextType } from "./AuthenticationContext";

export type UpdateAuthenticationContextType = (
  newState: AuthenticationContextType,
) => void;

export const UpdateAuthenticationContext =
  createContext<UpdateAuthenticationContextType>(() => {});
