import JSZip from "jszip";
import { InvalidTaskBlobError } from "../errors/task-errors";
import * as TaskImporter from "../task-importer";

/**
 * Mocks TaskImporter.loadJSZip to work around Node.js Blob incompatibility with jsdom.
 *
 * JSZip uses FileReader internally, which in jsdom only accepts jsdom's Blob implementation.
 * Node.js Blob causes: "Failed to execute 'readAsArrayBuffer' on 'FileReader': parameter 1 is not of type 'Blob'"
 *
 * We convert Blob → Uint8Array, which JSZip accepts directly without needing FileReader.
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
