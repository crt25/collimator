import JSZip from "jszip";
import {
  CrtInternalFiles,
  GenericNotebookFiles,
  TaskFormat,
} from "../task-format";
import * as TaskImporter from "../task-importer";
import {
  InvalidTaskBlobError,
  MissingRequiredFilesError,
} from "../errors/task-errors";
import { mockTaskImporterLoadJSZip, expectError } from "./helpers";

describe("importCrtInternalTask", () => {
  let mockZip: JSZip;
  let cleanup: () => void;

  beforeAll(() => {
    cleanup = mockTaskImporterLoadJSZip();
  });

  beforeEach(() => {
    mockZip = new JSZip();
  });

  afterAll(() => {
    cleanup();
  });

  describe("valid tasks", () => {
    it("should successfully import a task with all files", async () => {
      const templateContent = "template content";
      const studentContent = "student content";
      const autograderContent = "autograder content";
      const dataFile = "data.txt";
      const dataContent = "data content";
      const gradingDataFile = "grading-data.txt";
      const gradingDataContent = "grading data content";
      const srcFile = "code.py";
      const srcContent = "print('hello')";
      const gradingSrcFile = "test.py";
      const gradingSrcContent = "print('test')";

      mockZip.file(CrtInternalFiles.template, templateContent);
      mockZip.file(CrtInternalFiles.student, studentContent);
      mockZip.file(CrtInternalFiles.autograder, autograderContent);
      mockZip.file(`${CrtInternalFiles.data}/${dataFile}`, dataContent);
      mockZip.file(
        `${CrtInternalFiles.gradingData}/${gradingDataFile}`,
        gradingDataContent,
      );
      mockZip.file(`${CrtInternalFiles.src}/${srcFile}`, srcContent);
      mockZip.file(
        `${CrtInternalFiles.gradingSrc}/${gradingSrcFile}`,
        gradingSrcContent,
      );

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await TaskImporter.importCrtInternalTask(blob);

      expect(result.taskTemplateFile).toBeInstanceOf(Blob);
      expect(result.studentTaskFile).toBeInstanceOf(Blob);
      expect(result.autograderFile).toBeInstanceOf(Blob);

      expect(await result.taskTemplateFile.text()).toBe(templateContent);
      expect(await result.studentTaskFile.text()).toBe(studentContent);
      expect(await result.autograderFile.text()).toBe(autograderContent);

      expect(result.data).toBeDefined();
      expect(result.gradingData).toBeDefined();
      expect(result.src).toBeDefined();
      expect(result.gradingSrc).toBeDefined();

      expect(result.data.get(dataFile)).toBeInstanceOf(Blob);
      expect(result.gradingData.get(gradingDataFile)).toBeInstanceOf(Blob);
      expect(result.src.get(srcFile)).toBeInstanceOf(Blob);
      expect(result.gradingSrc.get(gradingSrcFile)).toBeInstanceOf(Blob);

      expect(await result.data.get(dataFile)!.text()).toBe(dataContent);
      expect(await result.gradingData.get(gradingDataFile)!.text()).toBe(
        gradingDataContent,
      );
      expect(await result.src.get(srcFile)!.text()).toBe(srcContent);
      expect(await result.gradingSrc.get(gradingSrcFile)!.text()).toBe(
        gradingSrcContent,
      );
    });

    it("should handle tasks with empty optional folders", async () => {
      mockZip.file(CrtInternalFiles.template, "template content");
      mockZip.file(CrtInternalFiles.student, "student content");
      mockZip.file(CrtInternalFiles.autograder, "autograder content");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await TaskImporter.importCrtInternalTask(blob);

      expect(result.data.size).toBe(0);
      expect(result.gradingData.size).toBe(0);
      expect(result.src.size).toBe(0);
      expect(result.gradingSrc.size).toBe(0);
    });

    it("should correctly extract files from nested folders", async () => {
      const nestedContent = "nested content";
      const codeContent = "print('hello')";

      mockZip.file(CrtInternalFiles.template, "template content");
      mockZip.file(CrtInternalFiles.student, "student content");
      mockZip.file(CrtInternalFiles.autograder, "autograder content");
      mockZip.file(`${CrtInternalFiles.data}/nested/file.txt`, nestedContent);
      mockZip.file(`${CrtInternalFiles.src}/code.py`, codeContent);

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await TaskImporter.importCrtInternalTask(blob);

      expect(result.data.get("nested/file.txt")).toBeInstanceOf(Blob);
      expect(result.src.get("code.py")).toBeInstanceOf(Blob);

      expect(await result.data.get("nested/file.txt")!.text()).toBe(
        nestedContent,
      );
      expect(await result.src.get("code.py")!.text()).toBe(codeContent);
    });

    it("should handle binary files in data folder", async () => {
      mockZip.file(CrtInternalFiles.template, "template");
      mockZip.file(CrtInternalFiles.student, "student");
      mockZip.file(CrtInternalFiles.autograder, "autograder");

      const binaryData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
      mockZip.file(`${CrtInternalFiles.data}/image.png`, binaryData);

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await TaskImporter.importCrtInternalTask(blob);

      expect(result.data.get("image.png")).toBeInstanceOf(Blob);

      const resultBlob = result.data.get("image.png")!;
      const resultArray = new Uint8Array(await resultBlob.arrayBuffer());
      expect(resultArray).toEqual(binaryData);
    });
  });

  describe("missing required files", () => {
    it("should throw MissingRequiredFilesError when template file is missing", async () => {
      mockZip.file(CrtInternalFiles.student, "student content");
      mockZip.file(CrtInternalFiles.autograder, "autograder content");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const error = await expectError(
        () => TaskImporter.importCrtInternalTask(blob),
        MissingRequiredFilesError,
      );

      expect(error.format).toBe(TaskFormat.CrtInternal);
      expect(error.requiredFiles).toContain(CrtInternalFiles.template);
      expect(error.requiredFiles).toContain(CrtInternalFiles.student);
      expect(error.requiredFiles).toContain(CrtInternalFiles.autograder);
      expect(error.actualFiles).not.toContain(CrtInternalFiles.template);
      expect(error.actualFiles).toContain(CrtInternalFiles.student);
      expect(error.actualFiles).toContain(CrtInternalFiles.autograder);
    });

    it("should throw MissingRequiredFilesError when student file is missing", async () => {
      mockZip.file(CrtInternalFiles.template, "template content");
      mockZip.file(CrtInternalFiles.autograder, "autograder content");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const error = await expectError(
        () => TaskImporter.importCrtInternalTask(blob),
        MissingRequiredFilesError,
      );

      expect(error).toBeInstanceOf(MissingRequiredFilesError);
    });

    it("should throw MissingRequiredFilesError when autograder file is missing", async () => {
      mockZip.file(CrtInternalFiles.template, "template content");
      mockZip.file(CrtInternalFiles.student, "student content");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const error = await expectError(
        () => TaskImporter.importCrtInternalTask(blob),
        MissingRequiredFilesError,
      );

      expect(error).toBeInstanceOf(MissingRequiredFilesError);
    });
  });

  describe("invalid input", () => {
    it("should throw InvalidTaskBlobError when blob is not a valid ZIP", async () => {
      const invalidBlob = new Blob(["not a zip file"], { type: "text/plain" });

      const error = await expectError(
        () => TaskImporter.importCrtInternalTask(invalidBlob),
        InvalidTaskBlobError,
      );

      expect(error).toBeInstanceOf(InvalidTaskBlobError);
    });
  });
});

describe("importGenericNotebookTask", () => {
  let mockZip: JSZip;
  let cleanup: () => void;

  beforeAll(() => {
    cleanup = mockTaskImporterLoadJSZip();
  });

  beforeEach(() => {
    mockZip = new JSZip();
  });

  afterAll(() => {
    cleanup();
  });

  describe("valid tasks", () => {
    it("should successfully import a task with required file and data", async () => {
      const taskContent = "task content";
      const dataFile = "data.txt";

      mockZip.file(GenericNotebookFiles.task, taskContent);
      mockZip.file(`${GenericNotebookFiles.data}/${dataFile}`, "data content");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await TaskImporter.importGenericNotebookTask(blob);

      expect(result.taskFile).toBeInstanceOf(Blob);
      expect(result.data).toBeDefined();
      expect(result.gradingData).toBeDefined();
      expect(result.src).toBeDefined();
      expect(result.gradingSrc).toBeDefined();
    });

    it("should handle tasks with all optional folders populated", async () => {
      mockZip.file(GenericNotebookFiles.task, "task content");
      mockZip.file(`${GenericNotebookFiles.data}/data.txt`, "data");
      mockZip.file(
        `${GenericNotebookFiles.gradingData}/grading.txt`,
        "grading",
      );
      mockZip.file(`${GenericNotebookFiles.src}/code.py`, "code");
      mockZip.file(`${GenericNotebookFiles.gradingSrc}/test.py`, "test");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await TaskImporter.importGenericNotebookTask(blob);

      expect(result.data.size).toBe(1);
      expect(result.gradingData.size).toBe(1);
      expect(result.src.size).toBe(1);
      expect(result.gradingSrc.size).toBe(1);

      expect(result.data.get("data.txt")).toBeInstanceOf(Blob);
      expect(result.gradingData.get("grading.txt")).toBeInstanceOf(Blob);
      expect(result.src.get("code.py")).toBeInstanceOf(Blob);
      expect(result.gradingSrc.get("test.py")).toBeInstanceOf(Blob);
    });

    it("should handle empty ZIP with only required file", async () => {
      mockZip.file(GenericNotebookFiles.task, "minimal task");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await TaskImporter.importGenericNotebookTask(blob);

      expect(result.taskFile).toBeInstanceOf(Blob);
      expect(result.data.size).toBe(0);
      expect(result.gradingData.size).toBe(0);
      expect(result.src.size).toBe(0);
      expect(result.gradingSrc.size).toBe(0);
    });

    it("should preserve file structure with multiple levels", async () => {
      const deepContent = "code";

      mockZip.file(GenericNotebookFiles.task, "task");
      mockZip.file(
        `${GenericNotebookFiles.src}/level1/level2/deep.py`,
        deepContent,
      );

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await TaskImporter.importGenericNotebookTask(blob);

      expect(result.src.get("level1/level2/deep.py")).toBeInstanceOf(Blob);

      expect(await result.src.get("level1/level2/deep.py")!.text()).toBe(
        deepContent,
      );
    });

    it("should handle files with special characters in names", async () => {
      const content = "content";

      mockZip.file(GenericNotebookFiles.task, "task");
      mockZip.file(
        `${GenericNotebookFiles.data}/file with spaces & special.txt`,
        content,
      );

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await TaskImporter.importGenericNotebookTask(blob);

      expect(result.data.get("file with spaces & special.txt")).toBeInstanceOf(
        Blob,
      );

      expect(
        await result.data.get("file with spaces & special.txt")!.text(),
      ).toBe(content);
    });
  });

  describe("missing required files", () => {
    it("should throw MissingRequiredFilesError when task file is missing", async () => {
      mockZip.file(`${GenericNotebookFiles.data}/file.txt`, "data content");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const error = await expectError(
        () => TaskImporter.importGenericNotebookTask(blob),
        MissingRequiredFilesError,
      );

      expect(error).toBeInstanceOf(MissingRequiredFilesError);
    });
  });

  describe("invalid input", () => {
    it("should throw InvalidTaskBlobError when blob is not a valid ZIP", async () => {
      const invalidBlob = new Blob(["not a zip file"], { type: "text/plain" });

      const error = await expectError(
        () => TaskImporter.importGenericNotebookTask(invalidBlob),
        InvalidTaskBlobError,
      );

      expect(error).toBeInstanceOf(InvalidTaskBlobError);
    });

    it("should throw InvalidTaskBlobError with proper error message", async () => {
      const invalidBlob = new Blob(["not a zip file"], { type: "text/plain" });

      const error = await expectError(
        () => TaskImporter.importGenericNotebookTask(invalidBlob),
        InvalidTaskBlobError,
      );

      expect(error).toBeInstanceOf(InvalidTaskBlobError);
      expect(error.message).toBeTruthy();
    });
  });
});

describe("loadJSZip", () => {
  let cleanup: () => void;

  beforeAll(() => {
    cleanup = mockTaskImporterLoadJSZip();
  });

  afterAll(() => {
    cleanup();
  });

  it("should successfully load a valid ZIP blob", async () => {
    const mockZip = new JSZip();
    mockZip.file("test.txt", "test content");
    const blob = await mockZip.generateAsync({ type: "blob" });

    const result = await TaskImporter.loadJSZip(blob);

    expect(result).toBeInstanceOf(JSZip);
    expect(result?.files["test.txt"]).toBeDefined();
  });

  it("should throw InvalidTaskBlobError for invalid blob", async () => {
    const invalidBlob = new Blob(["invalid zip"], { type: "text/plain" });

    const error = await expectError(
      () => TaskImporter.loadJSZip(invalidBlob),
      InvalidTaskBlobError,
    );

    expect(error).toBeInstanceOf(InvalidTaskBlobError);
  });

  it("should include error message in InvalidTaskBlobError", async () => {
    const invalidBlob = new Blob(["corrupted data"], { type: "text/plain" });

    const error = await expectError(
      () => TaskImporter.loadJSZip(invalidBlob),
      InvalidTaskBlobError,
    );

    expect(error).toBeInstanceOf(InvalidTaskBlobError);
    expect(error.message).toBeTruthy();
  });

  it("should handle empty blob", async () => {
    const emptyBlob = new Blob([], { type: "application/zip" });

    const error = await expectError(
      () => TaskImporter.loadJSZip(emptyBlob),
      InvalidTaskBlobError,
    );

    expect(error).toBeInstanceOf(InvalidTaskBlobError);
  });
});
