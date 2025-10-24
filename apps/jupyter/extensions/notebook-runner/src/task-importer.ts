import JSZip from "jszip";
import { CrtInternalFiles } from "./task-format";

export interface CrtInternalTask {
  taskTemplate: Blob;
  studentTask: Blob;
  autograder: Blob;
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

  for (const [path, file] of Object.entries(zip.files)) {
    const relativePath = path.substring(folderPath.length);
    if (relativePath) {
      const blob = await file.async("blob");
      files.set(relativePath, blob);
      console.log(`extracted from ${relativePath} from ${folderPath}`);
    }
  }
  return files;
};

export const importCrtInternalTask = async (
  task: Blob,
): Promise<CrtInternalTask> => {
  const zip = new JSZip();
  await zip.loadAsync(task);

  const taskTemplate = await zip.file(CrtInternalFiles.Template)?.async("blob");
  const studentTask = await zip.file(CrtInternalFiles.Student)?.async("blob");
  const autograder = await zip.file(CrtInternalFiles.Autograder)?.async("blob");

  if (!taskTemplate || !studentTask || !autograder) {
    throw new Error("Crt internal format is missing required files.");
  }

  const data = await extractFolder(zip, CrtInternalFiles.Data);
  const gradingData = await extractFolder(zip, CrtInternalFiles.GradingData);
  const src = await extractFolder(zip, CrtInternalFiles.Src);
  const gradingSrc = await extractFolder(zip, CrtInternalFiles.GradingSrc);

  console.log(data, gradingData, src, gradingSrc);

  return {
    taskTemplate,
    studentTask,
    autograder,
    data,
    gradingData,
    src,
    gradingSrc,
  };
};
