import { MessageKeys } from "../translator";

type Messages = {
  [K in (typeof MessageKeys)[keyof typeof MessageKeys]]: string;
};

export const enMessages: Messages = {
  "useEmbeddedPython.cannotLoadProject": "Cannot load project: {error}",
  "useEmbeddedPython.cannotSaveProject": "Cannot save project: {error}",
  "useEmbeddedPython.cannotImportTask": "Cannot import task: {error}",
  "useEmbeddedPython.cannotGetTask": "Cannot get task: {error}",
  "useEmbeddedPython.submissionLoaded": "Submission loaded successfully",
  "useEmbeddedPython.taskCreated": "Task created successfully",
  "useEmbeddedPython.taskImported": "Task imported successfully",
  "useEmbeddedPython.taskLoaded": "Task loaded successfully",
  "useEmbeddedPython.cannotImportExternalInNonEditMode":
    "Cannot import external tasks in non-edit mode",
};
