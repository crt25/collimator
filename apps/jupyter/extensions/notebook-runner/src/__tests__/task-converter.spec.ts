import * as TaskConverter from "../task-converter";

import {
  mockTaskImporterLoadJSZip,
  mockTaskConverterExports,
} from "./helpers/common";

import {
  assertCrtInternalTaskEquality,
  assertGenericNotebookTaskEquality,
} from "./helpers/exports";
import { completeCrtTaskData, completeGenericTaskData } from "./helpers/data";

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
});
