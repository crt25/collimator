import JSZip from "jszip";
import { InvalidTaskBlobError, TaskError } from "../errors/task-errors";
import * as TaskImporter from "../task-converter";
import { CrtInternalFiles, GenericNotebookFiles } from "../task-format";
import { NoErrorThrownError } from "./errors";

/**
 * Mocks TaskImporter.loadJSZip to work around Node.js Blob incompatibility with jsdom.
 *
 * When global.Blob is set to Node.js Blob, JSZip's internal
 * The fileReader from jsdom rejects it with: "parameter 1 is not of type 'Blob'"
 *
 * This mock converts Node.js Blob -> ArrayBuffer -> Uint8Array, which JSZip
 * accepts directly without needing FileReader.
 *
 * @see: https://github.com/jsdom/jsdom/issues/2555
 */
export const mockTaskImporterLoadJSZip = (): (() => void) => {
  const spy = jest
    .spyOn(TaskImporter, "loadJSZip")
    .mockImplementation(async (task: Blob): Promise<JSZip> => {
      const zip = new JSZip();
      try {
        const arrayBuffer = await task.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        await zip.loadAsync(uint8Array);
        return zip;
      } catch (error) {
        throw new InvalidTaskBlobError(error);
      }
    });

  return () => {
    spy.mockRestore();
  };
};

export const loadExportedBlob = async (blob: Blob): Promise<JSZip> => {
  const zip = new JSZip();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    await zip.loadAsync(uint8Array);
    return zip;
  } catch (error) {
    throw new InvalidTaskBlobError(error);
  }
};

/**
 * Mocks TaskConverter export functions to work around Node.js Blob incompatibility with jsdom.
 * The issue occurs in two places during export:
 * 1. When JSZip generates the zip as a Blob, it uses FileReader internally.
 * 2. When JSZip generates the output Blob for each file added, it also uses FileReader.
 *
 * This mock fixes both issues by:
 * 1. Converting all input Blobs to Uint8Array via arrayBuffer() before passing to zip.file().
 * 2. Generating the zip as Uint8Array instead of Blob, then wrapping in a new blob.
 *
 * @see https://github.com/jsdom/jsdom/issues/2555
 */
export const mockTaskConverterExports = (): (() => void) => {
  const exportCrtSpy = jest
    .spyOn(TaskImporter, "exportCrtInternalTask")
    .mockImplementation(async (task) => {
      const zip = new JSZip();

      // convert Blobs to Uint8Array to avoid FileReader issues
      zip.file(
        CrtInternalFiles.template,
        new Uint8Array(await task.taskTemplateFile.arrayBuffer()),
      );
      zip.file(
        CrtInternalFiles.student,
        new Uint8Array(await task.studentTaskFile.arrayBuffer()),
      );
      zip.file(
        CrtInternalFiles.autograder,
        new Uint8Array(await task.autograderFile.arrayBuffer()),
      );

      if (task.data.size > 0) {
        for (const [path, blob] of task.data) {
          zip.file(
            `${CrtInternalFiles.data}/${path}`,
            new Uint8Array(await blob.arrayBuffer()),
          );
        }
      }

      if (task.gradingData.size > 0) {
        for (const [path, blob] of task.gradingData) {
          zip.file(
            `${CrtInternalFiles.gradingData}/${path}`,
            new Uint8Array(await blob.arrayBuffer()),
          );
        }
      }

      if (task.src.size > 0) {
        for (const [path, blob] of task.src) {
          zip.file(
            `${CrtInternalFiles.src}/${path}`,
            new Uint8Array(await blob.arrayBuffer()),
          );
        }
      }

      if (task.gradingSrc.size > 0) {
        for (const [path, blob] of task.gradingSrc) {
          zip.file(
            `${CrtInternalFiles.gradingSrc}/${path}`,
            new Uint8Array(await blob.arrayBuffer()),
          );
        }
      }

      const data = await zip.generateAsync({ type: "uint8array" });
      return new Blob([new Uint8Array(data)], { type: "application/zip" });
    });

  const exportGenericSpy = jest
    .spyOn(TaskImporter, "exportExternalCustomTask")
    .mockImplementation(async (task) => {
      const zip = new JSZip();

      zip.file(
        GenericNotebookFiles.task,
        new Uint8Array(await task.taskFile.arrayBuffer()),
      );

      if (task.data.size > 0) {
        for (const [path, blob] of task.data) {
          zip.file(
            `${GenericNotebookFiles.data}/${path}`,
            new Uint8Array(await blob.arrayBuffer()),
          );
        }
      }

      if (task.gradingData.size > 0) {
        for (const [path, blob] of task.gradingData) {
          zip.file(
            `${GenericNotebookFiles.gradingData}/${path}`,
            new Uint8Array(await blob.arrayBuffer()),
          );
        }
      }

      if (task.src.size > 0) {
        for (const [path, blob] of task.src) {
          zip.file(
            `${GenericNotebookFiles.src}/${path}`,
            new Uint8Array(await blob.arrayBuffer()),
          );
        }
      }

      if (task.gradingSrc.size > 0) {
        for (const [path, blob] of task.gradingSrc) {
          zip.file(
            `${GenericNotebookFiles.gradingSrc}/${path}`,
            new Uint8Array(await blob.arrayBuffer()),
          );
        }
      }

      const data = await zip.generateAsync({ type: "uint8array" });
      return new Blob([new Uint8Array(data)], { type: "application/zip" });
    });

  return () => {
    exportCrtSpy.mockRestore();
    exportGenericSpy.mockRestore();
  };
};

export const expectError = async <TError extends TaskError>(
  call: () => unknown,
  errorType: new (...args: never[]) => TError,
): Promise<TError> => {
  try {
    await call();
    throw new NoErrorThrownError();
  } catch (error: unknown) {
    if (error instanceof NoErrorThrownError) {
      throw error;
    }
    if (!(error instanceof errorType)) {
      const constructorName =
        error instanceof Error ? error.constructor.name : typeof error;
      throw new TypeError(
        `Expected error of type ${errorType.name}, but got ${constructorName}`,
      );
    }
    return error;
  }
};
