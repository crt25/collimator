import * as TaskConverter from "../task-converter";

import {
  mockTaskImporterLoadJSZip,
  mockTaskConverterExports,
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

describe("export and import round-trip", () => {
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

  it("should be able to import exported CRT internal task", async () => {
    const exported =
      await TaskConverter.exportCrtInternalTask(completeCrtTaskData);
    const imported = await TaskConverter.importCrtInternalTask(exported);

    await assertCrtInternalTaskEquality(imported, completeCrtTaskData);
  });

  it("should be able to import exported generic notebook task", async () => {
    const exported = await TaskConverter.exportExternalCustomTask(
      completeGenericTaskData,
    );
    const imported = await TaskConverter.importGenericNotebookTask(exported);

    await assertGenericNotebookTaskEquality(imported, completeGenericTaskData);
  });

  it("should be able to import-export-import-export for CRT internal task", async () => {
    const firstImport = await TaskConverter.importCrtInternalTask(
      await TaskConverter.exportCrtInternalTask(completeCrtTaskData),
    );

    const firstExport = await TaskConverter.exportCrtInternalTask(firstImport);

    const secondImport = await TaskConverter.importCrtInternalTask(firstExport);

    const secondExport =
      await TaskConverter.exportCrtInternalTask(secondImport);

    await assertCrtInternalTaskEquality(
      await TaskConverter.importCrtInternalTask(secondExport),

      completeCrtTaskData,
    );
  });

  it("should be able to import-export-import-export for generic notebook task", async () => {
    const firstImport = await TaskConverter.importGenericNotebookTask(
      await TaskConverter.exportExternalCustomTask(completeGenericTaskData),
    );

    const firstExport =
      await TaskConverter.exportExternalCustomTask(firstImport);

    const secondImport =
      await TaskConverter.importGenericNotebookTask(firstExport);

    const secondExport =
      await TaskConverter.exportExternalCustomTask(secondImport);

    await assertGenericNotebookTaskEquality(
      await TaskConverter.importGenericNotebookTask(secondExport),
      completeGenericTaskData,
    );
  });

  it("should be able to handle round-trip with empty optional folders", async () => {
    const exported =
      await TaskConverter.exportCrtInternalTask(emptyCrtTaskData);

    const imported = await TaskConverter.importCrtInternalTask(exported);

    await assertCrtInternalTaskEquality(imported, emptyCrtTaskData);
  });
});
