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
