import JSZip from "jszip";
import {
  FileSystemError,
  InvalidTaskBlobError,
  MissingRequiredFilesError,
} from "./errors/task-errors";
import {
  CrtInternalFiles,
  ExternalCustomFiles,
  TaskFormat,
} from "./task-format";

export type FileMap = Map<string, Blob>;

type File = Blob;
type FilePath = string;

/** This represents a flattened directory structure where FilePath may include nested subfolders. */
type Directory = Map<FilePath, File>;

export interface CrtInternalTask {
  taskTemplateFile: File;
  studentTaskFile: File;
  autograderFile: File;
  data: Directory;
  gradingData: Directory;
  src: Directory;
  gradingSrc: Directory;
}

export interface ExternalCustomTask {
  taskFile: File;
  data: Directory;
  gradingData: Directory;
  src: Directory;
  gradingSrc: Directory;
}

export enum FileSystemOperation {
  ExtractZipFile = "extract zip file",
  ReadFolder = "read folder",
}

const extractFolder = async (
  zip: JSZip,
  prefix: string,
): Promise<Directory> => {
  const files = new Map<FilePath, File>();

  const folderPath = prefix.endsWith("/") ? prefix : `${prefix}/`;

  try {
    // zip.files is an object where keys are file paths and values are JSZip objects
    for (const [path, file] of Object.entries(zip.files)) {
      if (!path.startsWith(folderPath)) {
        // Skip files outside the specified folder
        continue;
      }

      if (file.dir) {
        // Skip directories
        continue;
      }

      const relativePath = path.substring(folderPath.length);

      if (!relativePath) {
        // Only process files within the specified folder
        continue;
      }

      try {
        const blob = await file.async("blob");
        files.set(relativePath, blob);
      } catch (error) {
        throw new FileSystemError(
          FileSystemOperation.ExtractZipFile,
          path,
          error instanceof Error ? error : undefined,
        );
      }
    }
  } catch (error) {
    if (error instanceof FileSystemError) {
      throw error;
    }

    throw new FileSystemError(
      FileSystemOperation.ReadFolder,
      prefix,
      error instanceof Error ? error : undefined,
    );
  }

  return files;
};

export const importCrtInternalTask = async (
  task: Blob,
): Promise<CrtInternalTask> => {
  const zip = await loadJSZip(task);

  const taskTemplateFile = await zip
    .file(CrtInternalFiles.Template)
    ?.async("blob");

  const studentTaskFile = await zip
    .file(CrtInternalFiles.Student)
    ?.async("blob");

  const autograderFile = await zip
    .file(CrtInternalFiles.Autograder)
    ?.async("blob");

  if (!taskTemplateFile || !studentTaskFile || !autograderFile) {
    throw new MissingRequiredFilesError(
      TaskFormat.CrtInternal,
      [
        CrtInternalFiles.Template,
        CrtInternalFiles.Student,
        CrtInternalFiles.Autograder,
      ],
      Object.keys(zip.files),
    );
  }

  const data = await extractFolder(zip, CrtInternalFiles.Data);
  const gradingData = await extractFolder(zip, CrtInternalFiles.GradingData);
  const src = await extractFolder(zip, CrtInternalFiles.Src);
  const gradingSrc = await extractFolder(zip, CrtInternalFiles.GradingSrc);

  return {
    taskTemplateFile,
    studentTaskFile,
    autograderFile,
    data,
    gradingData,
    src,
    gradingSrc,
  } satisfies CrtInternalTask;
};

export const importExternalCustomTask = async (
  task: Blob,
): Promise<ExternalCustomTask> => {
  const zip = await loadJSZip(task);

  const taskFile = await zip.file(ExternalCustomFiles.Task)?.async("blob");

  if (!taskFile) {
    throw new MissingRequiredFilesError(
      TaskFormat.ExternalCustom,
      [ExternalCustomFiles.Task],
      Object.keys(zip.files),
    );
  }

  const data = await extractFolder(zip, ExternalCustomFiles.Data);
  const gradingData = await extractFolder(zip, ExternalCustomFiles.GradingData);
  const src = await extractFolder(zip, ExternalCustomFiles.Src);
  const gradingSrc = await extractFolder(zip, ExternalCustomFiles.GradingSrc);

  return {
    taskFile,
    data,
    gradingData,
    src,
    gradingSrc,
  };
};

export const loadJSZip = async (task: Blob): Promise<JSZip> => {
  let zip: JSZip;
  try {
    zip = new JSZip();
    await zip.loadAsync(task);
  } catch (error) {
    throw new InvalidTaskBlobError(
      error instanceof Error ? error : undefined,
      "Failed to read ZIP archive",
    );
  }
  return zip;
};
