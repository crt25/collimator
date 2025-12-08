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

const completeCrtTaskData = {
  taskTemplateFile: new Blob(["template content"]),
  studentTaskFile: new Blob(["student content"]),
  autograderFile: new Blob(["autograder content"]),
  data: new Map([["data.txt", new Blob(["data content"])]]),
  gradingData: new Map([["grading.txt", new Blob(["grading content"])]]),
  src: new Map([["code.py", new Blob(["print('hello')"])]]),
  gradingSrc: new Map([["test.py", new Blob(["print('test')"])]]),
};

const emptyCrtTaskData = {
  taskTemplateFile: new Blob(["template"]),
  studentTaskFile: new Blob(["student"]),
  autograderFile: new Blob(["autograder"]),
  data: new Map(),
  gradingData: new Map(),
  src: new Map(),
  gradingSrc: new Map(),
};

const completeGenericTaskData = {
  taskFile: new Blob(["task content"]),
  data: new Map([["data.txt", new Blob(["data content"])]]),
  gradingData: new Map([["grading.txt", new Blob(["grading content"])]]),
  src: new Map([["code.py", new Blob(["print('hello')"])]]),
  gradingSrc: new Map([["test.py", new Blob(["print('test')"])]]),
};

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
