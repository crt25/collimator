import { UnsupportedTaskFormatError } from "./errors/task-errors";
import {
  CrtInternalFiles,
  GenericNotebookFiles,
  TaskFormat,
} from "./task-format";
import { loadJSZip } from "./task-converter";

export const detectTaskFormat = async (taskBlob: Blob): Promise<TaskFormat> => {
  const zip = await loadJSZip(taskBlob);

  const hasCrtInternalFiles =
    zip.file(CrtInternalFiles.template) &&
    zip.file(CrtInternalFiles.student) &&
    zip.file(CrtInternalFiles.autograder);

  // If all CRT internal files are present, it's a CRT internal format
  if (hasCrtInternalFiles) {
    return TaskFormat.CrtInternal;
  }

  const hasGenericNotebookFormat = zip.file(GenericNotebookFiles.task);

  if (hasGenericNotebookFormat) {
    return TaskFormat.GenericNotebook;
  }

  throw new UnsupportedTaskFormatError(Object.keys(zip.files));
};
