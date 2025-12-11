import JSZip from "jszip";
import {
  FileSystemError,
  InvalidTaskBlobError,
  MissingRequiredFilesError,
  UnexpectedFileError,
} from "./errors/task-errors";
import {
  CrtInternalFiles,
  GenericNotebookFiles,
  TaskFormat,
} from "./task-format";

type File = Blob;

/** This represents a flattened directory structure where FilePath may include nested subfolders. */
export type Directory = Map<string, File>;

export interface CrtInternalTask {
  taskTemplateFile: File;
  studentTaskFile: File;
  autograderFile: File;
  data: Directory;
  gradingData: Directory;
  src: Directory;
  gradingSrc: Directory;
}

export interface GenericNotebookTask {
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

export interface SharedDirectories {
  data: Directory;
  gradingData: Directory;
  src: Directory;
  gradingSrc: Directory;
}

const extractFolder = async (
  zip: JSZip,
  prefix: string,
): Promise<Directory> => {
  const files = new Map<string, File>();

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
        throw new UnexpectedFileError(path);
      }

      try {
        const blob = await file.async("blob");
        files.set(relativePath, blob);
      } catch (error) {
        throw new FileSystemError(
          FileSystemOperation.ExtractZipFile,
          path,
          error,
        );
      }
    }
  } catch (error) {
    if (error instanceof FileSystemError) {
      throw error;
    }

    throw new FileSystemError(FileSystemOperation.ReadFolder, prefix, error);
  }

  return files;
};

export const importCrtInternalTask = async (
  task: Blob,
): Promise<CrtInternalTask> => {
  const zip = await loadJSZip(task);

  const taskTemplateFile = await getFileCaseInsensitive(
    zip,
    CrtInternalFiles.template,
  )?.async("blob");

  const studentTaskFile = await getFileCaseInsensitive(
    zip,
    CrtInternalFiles.student,
  )?.async("blob");

  const autograderFile = await getFileCaseInsensitive(
    zip,
    CrtInternalFiles.autograder,
  )?.async("blob");

  if (!taskTemplateFile || !studentTaskFile || !autograderFile) {
    throw new MissingRequiredFilesError(
      TaskFormat.CrtInternal,
      [
        CrtInternalFiles.template,
        CrtInternalFiles.student,
        CrtInternalFiles.autograder,
      ],
      Object.keys(zip.files),
    );
  }

  const data = await extractFolder(zip, CrtInternalFiles.data);
  const gradingData = await extractFolder(zip, CrtInternalFiles.gradingData);
  const src = await extractFolder(zip, CrtInternalFiles.src);
  const gradingSrc = await extractFolder(zip, CrtInternalFiles.gradingSrc);

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

export const importGenericNotebookTask = async (
  task: Blob,
): Promise<GenericNotebookTask> => {
  const zip = await loadJSZip(task);

  const taskFile = await getFileCaseInsensitive(
    zip,
    GenericNotebookFiles.task,
  )?.async("blob");

  if (!taskFile) {
    throw new MissingRequiredFilesError(
      TaskFormat.GenericNotebook,
      [GenericNotebookFiles.task],
      Object.keys(zip.files),
    );
  }

  const data = await extractFolder(zip, GenericNotebookFiles.data);
  const gradingData = await extractFolder(
    zip,
    GenericNotebookFiles.gradingData,
  );
  const src = await extractFolder(zip, GenericNotebookFiles.src);
  const gradingSrc = await extractFolder(zip, GenericNotebookFiles.gradingSrc);

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
    throw new InvalidTaskBlobError(error);
  }
  return zip;
};

const findFileCaseInsensitive = (
  zip: JSZip,
  targetPath: string,
): string | undefined => {
  const targetLower = targetPath.toLowerCase();
  return Object.keys(zip.files).find(
    (path) => path.toLowerCase() === targetLower,
  );
};

const getFileCaseInsensitive = (
  zip: JSZip,
  targetPath: string,
): JSZip.JSZipObject | null => {
  const actualPath = findFileCaseInsensitive(zip, targetPath);
  return actualPath ? zip.file(actualPath) : null;
};

export const exportCrtInternalTask = async (
  task: CrtInternalTask,
): Promise<Blob> => {
  const zip = new JSZip();

  zip.file(CrtInternalFiles.template, task.taskTemplateFile);
  zip.file(CrtInternalFiles.student, task.studentTaskFile);
  zip.file(CrtInternalFiles.autograder, task.autograderFile);

  if (task.data.size > 0) {
    for (const [path, blob] of task.data) {
      zip.file(`${CrtInternalFiles.data}/${path}`, blob);
    }
  }

  if (task.gradingData.size > 0) {
    for (const [path, blob] of task.gradingData) {
      zip.file(`${CrtInternalFiles.gradingData}/${path}`, blob);
    }
  }

  if (task.src.size > 0) {
    for (const [path, blob] of task.src) {
      zip.file(`${CrtInternalFiles.src}/${path}`, blob);
    }
  }

  if (task.gradingSrc.size > 0) {
    for (const [path, blob] of task.gradingSrc) {
      zip.file(`${CrtInternalFiles.gradingSrc}/${path}`, blob);
    }
  }

  return await zip.generateAsync({ type: "blob" });
};

export const exportExternalCustomTask = async (
  task: GenericNotebookTask,
): Promise<Blob> => {
  const zip = new JSZip();

  zip.file(GenericNotebookFiles.task, task.taskFile);

  if (task.data.size > 0) {
    // Add the data folder if it exists
    for (const [path, blob] of task.data) {
      zip.file(`${GenericNotebookFiles.data}/${path}`, blob);
    }
  }

  if (task.gradingData.size > 0) {
    for (const [path, blob] of task.gradingData) {
      zip.file(`${GenericNotebookFiles.gradingData}/${path}`, blob);
    }
  }

  if (task.src.size > 0) {
    for (const [path, blob] of task.src) {
      zip.file(`${GenericNotebookFiles.src}/${path}`, blob);
    }
  }

  if (task.gradingSrc.size > 0) {
    for (const [path, blob] of task.gradingSrc) {
      zip.file(`${GenericNotebookFiles.gradingSrc}/${path}`, blob);
    }
  }

  return await zip.generateAsync({ type: "blob" });
};
