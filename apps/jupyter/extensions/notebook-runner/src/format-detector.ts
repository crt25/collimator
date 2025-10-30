import { UnsupportedTaskFormatError } from "./errors/task-errors";
import {
  CrtFileIdentifier,
  CrtInternalFiles,
  GenericNotebookFiles,
  TaskFormat,
} from "./task-format";
import { loadJSZip } from "./task-importer";

export const detectTaskFormat = async (taskBlob: Blob): Promise<TaskFormat> => {
  const zip = await loadJSZip(taskBlob);

  // If the CRT file identifier is present, it's a CRT internal format
  if (zip.file(CrtFileIdentifier)) {
    return TaskFormat.CrtInternal;
  }

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
