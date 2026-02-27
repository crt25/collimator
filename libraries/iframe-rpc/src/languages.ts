export enum Language {
  en = "en",
  fr = "fr",
}

export function isLanguage(value: string): value is Language {
  return Object.values(Language).includes(value as Language);
}
