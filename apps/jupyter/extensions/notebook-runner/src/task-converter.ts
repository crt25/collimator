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

export interface CrtInternalTask {
  taskTemplateFile: Blob;
  studentTaskFile: Blob;
  autograderFile: Blob;
  data: Map<string, Blob>;
  gradingData: Map<string, Blob>;
  src: Map<string, Blob>;
  gradingSrc: Map<string, Blob>;
}

export interface ExternalCustomTask {
  taskFile: Blob;
  data: Map<string, Blob>;
  gradingData: Map<string, Blob>;
  src: Map<string, Blob>;
  gradingSrc: Map<string, Blob>;
}

const extractFolder = async (
  zip: JSZip,
  prefix: string,
): Promise<Map<string, Blob>> => {
  const files = new Map<string, Blob>();

  const folderPath = prefix.endsWith("/") ? prefix : `${prefix}/`;

  try {
    for (const [path, file] of Object.entries(zip.files)) {
      // Only process files within the specified folder
      if (path.startsWith(folderPath) && !file.dir) {
        const relativePath = path.substring(folderPath.length);
        if (relativePath) {
          try {
            const blob = await file.async("blob");
            files.set(relativePath, blob);
          } catch (error) {
            throw new FileSystemError(
              "extract",
              path,
              error instanceof Error ? error : undefined,
            );
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof FileSystemError) {
      throw error;
    }

    throw new FileSystemError(
      "read folder",
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
  };
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
      "Failed to read ZIP archive",
      error instanceof Error ? error.message : String(error),
    );
  }
  return zip;
};

export const exportCrtInternalTask = async (
  task: CrtInternalTask,
): Promise<Blob> => {
  const zip = new JSZip();

  zip.file(CrtInternalFiles.Template, task.taskTemplateFile);
  zip.file(CrtInternalFiles.Student, task.studentTaskFile);
  zip.file(CrtInternalFiles.Autograder, task.autograderFile);

  if (task.data.size > 0) {
    for (const [path, blob] of task.data) {
      zip.file(`${CrtInternalFiles.Data}/${path}`, blob);
    }
  }

  if (task.gradingData.size > 0) {
    for (const [path, blob] of task.gradingData) {
      zip.file(`${CrtInternalFiles.GradingData}/${path}`, blob);
    }
  }

  if (task.src.size > 0) {
    for (const [path, blob] of task.src) {
      zip.file(`${CrtInternalFiles.Src}/${path}`, blob);
    }
  }

  if (task.gradingSrc.size > 0) {
    for (const [path, blob] of task.gradingSrc) {
      zip.file(`${CrtInternalFiles.GradingSrc}/${path}`, blob);
    }
  }

  return await zip.generateAsync({ type: "blob" });
};

export const exportExternalCustomTask = async (
  task: ExternalCustomTask,
): Promise<Blob> => {
  const zip = new JSZip();

  zip.file(ExternalCustomFiles.Task, task.taskFile);

  if (task.data.size > 0) {
    // Add the data folder if it exists
    for (const [path, blob] of task.data) {
      zip.file(`${ExternalCustomFiles.Data}/${path}`, blob);
    }
  }

  if (task.gradingData.size > 0) {
    for (const [path, blob] of task.gradingData) {
      zip.file(`${ExternalCustomFiles.GradingData}/${path}`, blob);
    }
  }

  if (task.src.size > 0) {
    for (const [path, blob] of task.src) {
      zip.file(`${ExternalCustomFiles.Src}/${path}`, blob);
    }
  }

  if (task.gradingSrc.size > 0) {
    for (const [path, blob] of task.gradingSrc) {
      zip.file(`${ExternalCustomFiles.GradingSrc}/${path}`, blob);
    }
  }

  return await zip.generateAsync({ type: "blob" });
};
