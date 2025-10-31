import JSZip from "jszip";
import {
  InvalidTaskBlobError,
  NoErrorThrownError,
} from "../errors/task-errors";
import * as TaskImporter from "../task-importer";

/**
 * Mocks TaskImporter.loadJSZip to work around Node.js Blob incompatibility with jsdom.
 *
 * When global.Blob is set to Node.js Blob, JSZip's internal
 * The fileReader from jsdom rejects it with: "parameter 1 is not of type 'Blob'"
 *
 * This mock converts Node.js Blob -> ArrayBuffer -> Uint8Array, which JSZip
 * accepts directly without needing FileReader.
 *
 * See: https://github.com/jsdom/jsdom/issues/2555
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

export const expectError = async <TError extends Error>(
  call: () => unknown,
): Promise<TError> => {
  try {
    await call();
    throw new NoErrorThrownError();
  } catch (error: unknown) {
    if (error instanceof NoErrorThrownError) {
      throw error;
    }
    return error as TError;
  }
};
