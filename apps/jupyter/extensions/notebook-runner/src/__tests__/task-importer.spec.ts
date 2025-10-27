import JSZip from "jszip";
import { CrtInternalFiles, ExternalCustomFiles } from "../task-format";
import {
  importCrtInternalTask,
  importExternalCustomTask,
  loadJSZip,
} from "../task-importer";
import {
  InvalidTaskBlobError,
  MissingRequiredFilesError,
} from "../errors/task-errors";

describe("importCrtInternalTask", () => {
  let mockZip: JSZip;

  beforeEach(() => {
    mockZip = new JSZip();
  });

  describe("valid tasks", () => {
    it("should successfully import a task with all files", async () => {
      const templateContent = "template content";
      const studentContent = "student content";
      const autograderContent = "autograder content";
      const dataFile = "data.txt";
      const gradingDataFile = "grading-data.txt";

      mockZip.file(CrtInternalFiles.Template, templateContent);
      mockZip.file(CrtInternalFiles.Student, studentContent);
      mockZip.file(CrtInternalFiles.Autograder, autograderContent);
      mockZip.file(`${CrtInternalFiles.Data}/${dataFile}`, "data content");
      mockZip.file(
        `${CrtInternalFiles.GradingData}/${gradingDataFile}`,
        "grading data content",
      );

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await importCrtInternalTask(blob);

      expect(result.taskTemplateFile).toBeInstanceOf(Blob);
      expect(result.studentTaskFile).toBeInstanceOf(Blob);
      expect(result.autograderFile).toBeInstanceOf(Blob);
      expect(result.data).toBeDefined();
      expect(result.gradingData).toBeDefined();
      expect(result.src).toBeDefined();
      expect(result.gradingSrc).toBeDefined();
    });

    it("should handle tasks with empty optional folders", async () => {
      mockZip.file(CrtInternalFiles.Template, "template content");
      mockZip.file(CrtInternalFiles.Student, "student content");
      mockZip.file(CrtInternalFiles.Autograder, "autograder content");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await importCrtInternalTask(blob);

      expect(result.data.size).toBe(0);
      expect(result.gradingData.size).toBe(0);
      expect(result.src.size).toBe(0);
      expect(result.gradingSrc.size).toBe(0);
    });

    it("should correctly extract files from nested folders", async () => {
      mockZip.file(CrtInternalFiles.Template, "template content");
      mockZip.file(CrtInternalFiles.Student, "student content");
      mockZip.file(CrtInternalFiles.Autograder, "autograder content");
      mockZip.file(
        `${CrtInternalFiles.Data}/nested/file.txt`,
        "nested content",
      );
      mockZip.file(`${CrtInternalFiles.Src}/code.py`, "print('hello')");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await importCrtInternalTask(blob);

      expect(result.data.get("nested/file.txt")).toBeInstanceOf(Blob);
      expect(result.src.get("code.py")).toBeInstanceOf(Blob);
    });

    it("should handle binary files in data folder", async () => {
      mockZip.file(CrtInternalFiles.Template, "template");
      mockZip.file(CrtInternalFiles.Student, "student");
      mockZip.file(CrtInternalFiles.Autograder, "autograder");

      const binaryData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
      mockZip.file(`${CrtInternalFiles.Data}/image.png`, binaryData);

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await importCrtInternalTask(blob);

      expect(result.data.get("image.png")).toBeInstanceOf(Blob);
    });
  });

  describe("missing required files", () => {
    it("should throw MissingRequiredFilesError when template file is missing", async () => {
      mockZip.file(CrtInternalFiles.Student, "student content");
      mockZip.file(CrtInternalFiles.Autograder, "autograder content");

      const blob = await mockZip.generateAsync({ type: "blob" });

      await expect(importCrtInternalTask(blob)).rejects.toThrow(
        MissingRequiredFilesError,
      );
    });

    it("should throw MissingRequiredFilesError when student file is missing", async () => {
      mockZip.file(CrtInternalFiles.Template, "template content");
      mockZip.file(CrtInternalFiles.Autograder, "autograder content");

      const blob = await mockZip.generateAsync({ type: "blob" });

      await expect(importCrtInternalTask(blob)).rejects.toThrow(
        MissingRequiredFilesError,
      );
    });

    it("should throw MissingRequiredFilesError when autograder file is missing", async () => {
      mockZip.file(CrtInternalFiles.Template, "template content");
      mockZip.file(CrtInternalFiles.Student, "student content");

      const blob = await mockZip.generateAsync({ type: "blob" });

      await expect(importCrtInternalTask(blob)).rejects.toThrow(
        MissingRequiredFilesError,
      );
    });
  });

  describe("invalid input", () => {
    it("should throw InvalidTaskBlobError when blob is not a valid ZIP", async () => {
      const invalidBlob = new Blob(["not a zip file"], { type: "text/plain" });

      await expect(importCrtInternalTask(invalidBlob)).rejects.toThrow(
        InvalidTaskBlobError,
      );
    });
  });
});

describe("importExternalCustomTask", () => {
  let mockZip: JSZip;

  beforeEach(() => {
    mockZip = new JSZip();
  });

  describe("valid tasks", () => {
    it("should successfully import a task with required file and data", async () => {
      const taskContent = "task content";
      const dataFile = "data.txt";

      mockZip.file(ExternalCustomFiles.Task, taskContent);
      mockZip.file(`${ExternalCustomFiles.Data}/${dataFile}`, "data content");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await importExternalCustomTask(blob);

      expect(result.taskFile).toBeInstanceOf(Blob);
      expect(result.data).toBeDefined();
      expect(result.gradingData).toBeDefined();
      expect(result.src).toBeDefined();
      expect(result.gradingSrc).toBeDefined();
    });

    it("should handle tasks with all optional folders populated", async () => {
      mockZip.file(ExternalCustomFiles.Task, "task content");
      mockZip.file(`${ExternalCustomFiles.Data}/data.txt`, "data");
      mockZip.file(`${ExternalCustomFiles.GradingData}/grading.txt`, "grading");
      mockZip.file(`${ExternalCustomFiles.Src}/code.py`, "code");
      mockZip.file(`${ExternalCustomFiles.GradingSrc}/test.py`, "test");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await importExternalCustomTask(blob);

      expect(result.data.size).toBeGreaterThan(0);
      expect(result.gradingData.size).toBeGreaterThan(0);
      expect(result.src.size).toBeGreaterThan(0);
      expect(result.gradingSrc.size).toBeGreaterThan(0);
    });

    it("should handle empty ZIP with only required file", async () => {
      mockZip.file(ExternalCustomFiles.Task, "minimal task");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await importExternalCustomTask(blob);

      expect(result.taskFile).toBeInstanceOf(Blob);
      expect(result.data.size).toBe(0);
      expect(result.gradingData.size).toBe(0);
      expect(result.src.size).toBe(0);
      expect(result.gradingSrc.size).toBe(0);
    });

    it("should preserve file structure with multiple levels", async () => {
      mockZip.file(ExternalCustomFiles.Task, "task");
      mockZip.file(`${ExternalCustomFiles.Src}/level1/level2/deep.py`, "code");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await importExternalCustomTask(blob);

      expect(result.src.get("level1/level2/deep.py")).toBeInstanceOf(Blob);
    });

    it("should handle files with special characters in names", async () => {
      mockZip.file(ExternalCustomFiles.Task, "task");
      mockZip.file(
        `${ExternalCustomFiles.Data}/file with spaces & special.txt`,
        "content",
      );

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await importExternalCustomTask(blob);

      expect(result.data.get("file with spaces & special.txt")).toBeInstanceOf(
        Blob,
      );
    });
  });

  describe("missing required files", () => {
    it("should throw MissingRequiredFilesError when task file is missing", async () => {
      mockZip.file(`${ExternalCustomFiles.Data}/file.txt`, "data content");

      const blob = await mockZip.generateAsync({ type: "blob" });

      await expect(importExternalCustomTask(blob)).rejects.toThrow(
        MissingRequiredFilesError,
      );
    });
  });

  describe("invalid input", () => {
    it("should throw InvalidTaskBlobError when blob is not a valid ZIP", async () => {
      const invalidBlob = new Blob(["not a zip file"], { type: "text/plain" });

      await expect(importExternalCustomTask(invalidBlob)).rejects.toThrow(
        InvalidTaskBlobError,
      );
    });

    it("should throw InvalidTaskBlobError with proper error message", async () => {
      const invalidBlob = new Blob(["not a zip file"], { type: "text/plain" });

      try {
        await importExternalCustomTask(invalidBlob);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidTaskBlobError);
        expect((error as Error).message).toBeTruthy();
      }
    });
  });
});

describe("loadJSZip", () => {
  it("should successfully load a valid ZIP blob", async () => {
    const mockZip = new JSZip();
    mockZip.file("test.txt", "test content");
    const blob = await mockZip.generateAsync({ type: "blob" });

    const result = await loadJSZip(blob);

    expect(result).toBeInstanceOf(JSZip);
    expect(result?.files["test.txt"]).toBeDefined();
  });

  it("should throw InvalidTaskBlobError for invalid blob", async () => {
    const invalidBlob = new Blob(["invalid zip"], { type: "text/plain" });

    await expect(loadJSZip(invalidBlob)).rejects.toThrow(InvalidTaskBlobError);
  });

  it("should include error message in InvalidTaskBlobError", async () => {
    const invalidBlob = new Blob(["corrupted data"], { type: "text/plain" });

    try {
      await loadJSZip(invalidBlob);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidTaskBlobError);
      expect((error as Error).message).toContain("zip");
    }
  });

  it("should handle empty blob", async () => {
    const emptyBlob = new Blob([], { type: "application/zip" });

    await expect(loadJSZip(emptyBlob)).rejects.toThrow(InvalidTaskBlobError);
  });
});
