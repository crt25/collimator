import { createContext } from "react";

export type LocalizationState = {
  locale: string;
};

const defaultLocale = "en";
export const defaultLocalizationState: LocalizationState = {
  locale: defaultLocale,
};

type UpdateLocalizationContextType = {
  setState: (state: LocalizationState) => void;
};

export const UpdateLocalizationContext =
  createContext<UpdateLocalizationContextType>({
    setState: () => {},
  });
