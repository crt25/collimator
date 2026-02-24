import { Language } from "./iframe-rpc/src";

export enum JupyterLanguageLocales {
  en = "en",
  fr = "fr_FR",
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  default = "en",
}

export const crtToJupyter = new Map<Language, JupyterLanguageLocales>([
  [Language.en, JupyterLanguageLocales.en],
  [Language.fr, JupyterLanguageLocales.fr],
]);

export const jupyterToCrt = new Map<string, Language>([
  [JupyterLanguageLocales.fr, Language.fr],
  [JupyterLanguageLocales.en, Language.en],
  [JupyterLanguageLocales.default, Language.en],
]);

export const toJupyterLocale = (locale: Language): JupyterLanguageLocales => {
  return crtToJupyter.get(locale) ?? JupyterLanguageLocales.en;
};

export const toCrtLocale = (locale: string): Language => {
  return jupyterToCrt.get(locale) ?? Language.en;
};
