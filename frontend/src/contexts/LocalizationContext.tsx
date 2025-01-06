import { createContext } from "react";

export enum SupportedLocale {
  english = "en",
  french = "fr",
}

export type LocalizationState = {
  locale: SupportedLocale;
};

export const allSupportedLocales = new Set(Object.values(SupportedLocale));

const defaultLocale = SupportedLocale.english;
const defaultState: LocalizationState = {
  locale: defaultLocale,
};
export const defaultLocalizationState = (): LocalizationState => {
  if (typeof window === "undefined") {
    return defaultState;
  }

  const userLanguages = navigator.languages || [navigator.language];

  // navigator.languages is ordered by preference, so we only need to look
  // at the first match
  // if we want to country-based localization, we have to get rid of the substring() call
  const firstMatch = userLanguages
    .map((language) => language.substring(0, 2) as SupportedLocale)
    .find((language) => allSupportedLocales.has(language));

  const chosenLocale = (firstMatch as SupportedLocale) || defaultLocale;

  return {
    locale: chosenLocale,
  };
};

type UpdateLocalizationContextType = {
  setState: (state: LocalizationState) => void;
};

export const UpdateLocalizationContext =
  createContext<UpdateLocalizationContextType>({
    setState: () => {},
  });
