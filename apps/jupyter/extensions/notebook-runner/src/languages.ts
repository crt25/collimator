import { Language } from "./iframe-rpc/src";

export enum JupyterLanguageLocale {
  en = "en",
  fr = "fr_FR",
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  default = "en",
}

export const crtToJupyter = new Map<Language, JupyterLanguageLocale>([
  [Language.en, JupyterLanguageLocale.en],
  [Language.fr, JupyterLanguageLocale.fr],
]);

export const jupyterToCrt = new Map<string, Language>([
  [JupyterLanguageLocale.fr, Language.fr],
  [JupyterLanguageLocale.en, Language.en],
  [JupyterLanguageLocale.default, Language.en],
]);

export const toJupyterLocale = (locale: Language): JupyterLanguageLocale => {
  return crtToJupyter.get(locale) ?? JupyterLanguageLocale.en;
};

export const toCrtLocale = (locale: string): Language => {
  return jupyterToCrt.get(locale) ?? Language.en;
};
