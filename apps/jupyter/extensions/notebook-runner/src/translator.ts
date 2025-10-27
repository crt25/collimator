import { ITranslator } from "@jupyterlab/translation";
import enMessages from "./locales/en.json";
import frMessages from "./locales/fr.json";

const messages: Record<string, Record<string, string>> = {
  en: enMessages,
  fr: frMessages,
};

export const getMessage = (
  translator: ITranslator,
  key: string,
  values?: Record<string, string | number>,
): string => {
  const locale = translator.languageCode ?? "en";

  const localeMessages = messages[locale] ?? messages.en;

  let message = localeMessages[key] ?? messages.en[key] ?? key;

  if (values) {
    // Replace {variable} placeholders in the message with actual values
    message = message.replaceAll(/\{(\w+)\}/g, (_, varName) => {
      return String(values[varName] ?? `{${varName}}`);
    });
  }

  return message;
};

export const MessageKeys = {
  CannotLoadProject: "useEmbeddedPython.cannotLoadProject",
  CannotSaveProject: "useEmbeddedPython.cannotSaveProject",
  CannotImportTask: "useEmbeddedPython.cannotImportTask",
  CannotGetTask: "useEmbeddedPython.cannotGetTask",
} as const;
