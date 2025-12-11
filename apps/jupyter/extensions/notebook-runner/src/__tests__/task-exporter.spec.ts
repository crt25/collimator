import { CrtInternalFiles } from "../task-format";
import * as TaskConverter from "../task-converter";

import {
  mockTaskImporterLoadJSZip,
  mockTaskConverterExports,
  loadExportedBlob,
} from "./helpers/common";
import {
  assertCrtInternalTaskEquality,
  assertGenericNotebookTaskEquality,
} from "./helpers/exports";
import {
  completeCrtTaskData,
  emptyCrtTaskData,
  completeGenericTaskData,
} from "./helpers/data";

describe("exportCrtInternalTask", () => {
  let cleanupLoad: () => void;
  let cleanupExport: () => void;

  beforeAll(() => {
    cleanupLoad = mockTaskImporterLoadJSZip();
    cleanupExport = mockTaskConverterExports();
  });

  afterAll(() => {
    cleanupLoad();
    cleanupExport();
  });

  it("should successfully export a complete CRT internal task", async () => {
    const result =
      await TaskConverter.exportCrtInternalTask(completeCrtTaskData);
    expect(result).toBeInstanceOf(Blob);

    const resultZip = await loadExportedBlob(result);
    const regenerated = await resultZip.generateAsync({ type: "blob" });
    expect(regenerated).toBeInstanceOf(Blob);

    const imported = await TaskConverter.importCrtInternalTask(result);
    await assertCrtInternalTaskEquality(imported, completeCrtTaskData);
  });

  it("should export with empty optional folders", async () => {
    const result = await TaskConverter.exportCrtInternalTask(emptyCrtTaskData);

    const resultZip = await loadExportedBlob(result);

    const dataFiles = Object.keys(resultZip.files).filter((path) =>
      path.startsWith(CrtInternalFiles.data),
    );
    expect(dataFiles).toHaveLength(0);
  });
});

describe("exportExternalCustomTask", () => {
  let cleanupLoad: () => void;
  let cleanupExport: () => void;

  beforeAll(() => {
    cleanupLoad = mockTaskImporterLoadJSZip();
    cleanupExport = mockTaskConverterExports();
  });

  afterAll(() => {
    cleanupLoad();
    cleanupExport();
  });

  it("should successfully export a generic notebook task", async () => {
    const result = await TaskConverter.exportExternalCustomTask(
      completeGenericTaskData,
    );
    expect(result).toBeInstanceOf(Blob);

    const resultZip = await loadExportedBlob(result);
    const regenerated = await resultZip.generateAsync({ type: "blob" });

    expect(regenerated).toBeInstanceOf(Blob);
    const imported = await TaskConverter.importGenericNotebookTask(result);
    await assertGenericNotebookTaskEquality(imported, completeGenericTaskData);
  });
});
