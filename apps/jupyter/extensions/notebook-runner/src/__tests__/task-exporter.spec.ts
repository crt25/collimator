import { CrtInternalFiles, GenericNotebookFiles } from "../task-format";
import * as TaskConverter from "../task-converter";
import { CrtInternalTask, GenericNotebookTask } from "../task-converter";
import {
  mockTaskImporterLoadJSZip,
  mockTaskConverterExports,
  loadExportedBlob,
} from "./helpers";

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
    const task: CrtInternalTask = {
      taskTemplateFile: new Blob(["template content"]),
      studentTaskFile: new Blob(["student content"]),
      autograderFile: new Blob(["autograder content"]),
      data: new Map([["data.txt", new Blob(["data content"])]]),
      gradingData: new Map([["grading.txt", new Blob(["grading content"])]]),
      src: new Map([["code.py", new Blob(["print('hello')"])]]),
      gradingSrc: new Map([["test.py", new Blob(["print('test')"])]]),
    };

    const result = await TaskConverter.exportCrtInternalTask(task);
    expect(result).toBeInstanceOf(Blob);

    const resultZip = await loadExportedBlob(result);
    const regenerated = await resultZip.generateAsync({ type: "blob" });

    expect(regenerated).toBeInstanceOf(Blob);
    expect(resultZip.file(CrtInternalFiles.template)).not.toBeNull();
    expect(resultZip.file(CrtInternalFiles.student)).not.toBeNull();
    expect(resultZip.file(CrtInternalFiles.autograder)).not.toBeNull();
    expect(resultZip.file(`${CrtInternalFiles.data}/data.txt`)).not.toBeNull();
  });

  it("should export with empty optional folders", async () => {
    const task: CrtInternalTask = {
      taskTemplateFile: new Blob(["template"]),
      studentTaskFile: new Blob(["student"]),
      autograderFile: new Blob(["autograder"]),
      data: new Map(),
      gradingData: new Map(),
      src: new Map(),
      gradingSrc: new Map(),
    };

    const result = await TaskConverter.exportCrtInternalTask(task);

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
    const task: GenericNotebookTask = {
      taskFile: new Blob(["task content"]),
      data: new Map([["data.txt", new Blob(["data content"])]]),
      gradingData: new Map([["grading.txt", new Blob(["grading content"])]]),
      src: new Map([["code.py", new Blob(["print('hello')"])]]),
      gradingSrc: new Map([["test.py", new Blob(["print('test')"])]]),
    };

    const result = await TaskConverter.exportExternalCustomTask(task);
    expect(result).toBeInstanceOf(Blob);

    const resultZip = await loadExportedBlob(result);
    const regenerated = await resultZip.generateAsync({ type: "blob" });

    expect(regenerated).toBeInstanceOf(Blob);
    expect(resultZip.file(GenericNotebookFiles.task)).not.toBeNull();
    expect(
      resultZip.file(`${GenericNotebookFiles.data}/data.txt`),
    ).not.toBeNull();
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
    const task: CrtInternalTask = {
      taskTemplateFile: new Blob(["template"]),
      studentTaskFile: new Blob(["student"]),
      autograderFile: new Blob(["autograder"]),
      data: new Map([["data.txt", new Blob(["data content"])]]),
      gradingData: new Map([["grading.txt", new Blob(["grading content"])]]),
      src: new Map([["code.py", new Blob(["print('hello')"])]]),
      gradingSrc: new Map([["test.py", new Blob(["print('test')"])]]),
    };

    const exported = await TaskConverter.exportCrtInternalTask(task);
    const imported = await TaskConverter.importCrtInternalTask(exported);

    expect(await imported.taskTemplateFile.text()).toBe("template");
    expect(await imported.data.get("data.txt")?.text()).toBe("data content");
  });

  it("should be able to import exported generic notebook task", async () => {
    const task: GenericNotebookTask = {
      taskFile: new Blob(["task"]),
      data: new Map([["data.txt", new Blob(["data content"])]]),
      gradingData: new Map([["grading.txt", new Blob(["grading content"])]]),
      src: new Map([["code.py", new Blob(["print('hello')"])]]),
      gradingSrc: new Map([["test.py", new Blob(["print('test')"])]]),
    };

    const exported = await TaskConverter.exportExternalCustomTask(task);
    const imported = await TaskConverter.importGenericNotebookTask(exported);

    expect(await imported.taskFile.text()).toBe("task");
    expect(await imported.data.get("data.txt")?.text()).toBe("data content");
  });
});
