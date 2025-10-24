import JSZip from "jszip";
import {
  CrtFileIdentifier,
  CrtInternalFiles,
  ExternalCustomFiles,
  TaskFormat,
} from "./task-format";

export const detectTaskFormat = async (taskBlob: Blob): Promise<TaskFormat> => {
  try {
    const zip = new JSZip();
    await zip.loadAsync(taskBlob);

    if (zip.file(CrtFileIdentifier)) {
      return TaskFormat.CrtInternal;
    }

    const hasCrtInternalFiles =
      zip.file(CrtInternalFiles.Template) &&
      zip.file(CrtInternalFiles.Student) &&
      zip.file(CrtInternalFiles.Autograder);

    if (hasCrtInternalFiles) {
      return TaskFormat.CrtInternal;
    }

    const hasExternalCustomFormat = zip.file(ExternalCustomFiles.Task);

    if (hasExternalCustomFormat) {
      return TaskFormat.ExternalCustom;
    }

    return TaskFormat.Unknown;
  } catch {
    return TaskFormat.Unknown;
  }
};

export const validateTaskBlob = async (
  taskBlob: Blob,
): Promise<string | null> => {
  if (!taskBlob || taskBlob.size === 0) {
    return "Task file is empty";
  }

  try {
    const zip = new JSZip();
    await zip.loadAsync(taskBlob);
    return null;
  } catch (error) {
    return `Invalid ZIP file: ${error}`;
  }
};
