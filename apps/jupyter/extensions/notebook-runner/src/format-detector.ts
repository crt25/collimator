import JSZip from "jszip";
import { UnsupportedTaskFormatError } from "./errors/task-errors";
import {
  CrtFileIdentifier,
  CrtInternalFiles,
  GenericNotebookFiles,
  TaskFormat,
} from "./task-format";

export const detectTaskFormat = async (taskBlob: Blob): Promise<TaskFormat> => {
  const zip = new JSZip();

  try {
    await zip.loadAsync(taskBlob);
  } catch {
    throw new UnsupportedTaskFormatError(
      [],
      "Failed to read the project as ZIP archive.",
    );
  }

  // If the CRT file identifier is present, it's a CRT internal format
  if (zip.file(CrtFileIdentifier)) {
    return TaskFormat.CrtInternal;
  }

  const hasCrtInternalFiles =
    zip.file(CrtInternalFiles.Template) &&
    zip.file(CrtInternalFiles.Student) &&
    zip.file(CrtInternalFiles.Autograder);

  // If all CRT internal files are present, it's a CRT internal format
  if (hasCrtInternalFiles) {
    return TaskFormat.CrtInternal;
  }

  const hasGenericNotebookFormat = zip.file(GenericNotebookFiles.Task);

  if (hasGenericNotebookFormat) {
    return TaskFormat.GenericNotebook;
  }

  throw new UnsupportedTaskFormatError(Object.keys(zip.files));
};
