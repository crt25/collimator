export const JupyterLanguageLocales = {
  en: "en",
  fr: "fr_FR",
  default: "en",
} as const;

export type JupyterLanguageLocalesType =
  (typeof JupyterLanguageLocales)[keyof typeof JupyterLanguageLocales];
