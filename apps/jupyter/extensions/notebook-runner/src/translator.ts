import { ITranslator } from "@jupyterlab/translation";
import { showErrorMessage, showSuccessMessage } from "./notifications";
import { enMessages } from "./locales/en";
import { frMessages } from "./locales/fr";

const messages: Record<string, Record<string, string>> = {
  en: enMessages,
  fr: frMessages,
};

export const MessageKeys = {
  CannotLoadProject: "useEmbeddedPython.cannotLoadProject",
  CannotSaveProject: "useEmbeddedPython.cannotSaveProject",
  CannotImportTask: "useEmbeddedPython.cannotImportTask",
  CannotGetTask: "useEmbeddedPython.cannotGetTask",
  SubmissionLoaded: "useEmbeddedPython.submissionLoaded",
  TaskCreated: "useEmbeddedPython.taskCreated",
  TaskImported: "useEmbeddedPython.taskImported",
  TaskLoaded: "useEmbeddedPython.taskLoaded",
  CannotImportExternalInNonEditMode:
    "useEmbeddedPython.cannotImportExternalInNonEditMode",
  ExportError: "useEmbeddedPython.exportError",
} as const;

export class AppTranslator {
  constructor(private readonly translator: ITranslator) {}

  getMessage(key: string, values?: Record<string, string>): string {
    const locale = this.translator.languageCode ?? "en";
    const localeMessages = messages[locale] ?? messages.en;

    let message =
      localeMessages[key] ??
      messages.en[key] ??
      `Untranslated message key: '${key}'`;

    if (values) {
      // Replace {variable} placeholders in the message with actual values
      message = message.replaceAll(
        /\{(\w+)\}/g,
        (_, varName) => values[varName] ?? `{${varName}}`,
      );
    }

    return message;
  }

  displayError(key: string, values?: Record<string, string>): void {
    showErrorMessage(this.getMessage(key, values));
  }

  displaySuccess(key: string, values?: Record<string, string>): void {
    showSuccessMessage(this.getMessage(key, values));
  }

  displayErrorFromException(key: string, error: unknown): void {
    const errorMessage =
      error instanceof Error
        ? error.message
        : (error?.toString() ?? "Unknown error");

    this.displayError(key, { error: errorMessage });
  }
}
