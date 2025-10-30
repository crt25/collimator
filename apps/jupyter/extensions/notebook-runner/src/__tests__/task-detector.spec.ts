import JSZip from "jszip";
import {
  CrtFileIdentifier,
  CrtInternalFiles,
  GenericNotebookFiles,
  TaskFormat,
} from "../task-format";
import { UnsupportedTaskFormatError } from "../errors/task-errors";
import { detectTaskFormat } from "../format-detector";

describe("detectTaskFormat", () => {
  let mockZip: JSZip;

  beforeEach(() => {
    mockZip = new JSZip();
  });

  describe("CRT Internal format detection via identifier file", () => {
    it("should prioritize identifier file over other detection methods", async () => {
      mockZip.file(CrtFileIdentifier, "");
      mockZip.file(GenericNotebookFiles.task, "task");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await detectTaskFormat(blob);

      expect(result).toBe(TaskFormat.CrtInternal);
    });
  });

  describe("CRT Internal format detection via required files", () => {
    it("should detect CRT internal format with all three required files", async () => {
      mockZip.file(CrtInternalFiles.template, "template content");
      mockZip.file(CrtInternalFiles.student, "student content");
      mockZip.file(CrtInternalFiles.autograder, "autograder content");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await detectTaskFormat(blob);

      expect(result).toBe(TaskFormat.CrtInternal);
    });

    it("should not detect CRT internal when template is missing", async () => {
      mockZip.file(CrtInternalFiles.student, "student");
      mockZip.file(CrtInternalFiles.autograder, "autograder");

      const blob = await mockZip.generateAsync({ type: "blob" });

      await expect(detectTaskFormat(blob)).rejects.toThrow(
        UnsupportedTaskFormatError,
      );
    });

    it("should not detect CRT internal when student file is missing", async () => {
      mockZip.file(CrtInternalFiles.template, "template");
      mockZip.file(CrtInternalFiles.autograder, "autograder");

      const blob = await mockZip.generateAsync({ type: "blob" });

      await expect(detectTaskFormat(blob)).rejects.toThrow(
        UnsupportedTaskFormatError,
      );
    });

    it("should not detect CRT internal when autograder is missing", async () => {
      mockZip.file(CrtInternalFiles.template, "template");
      mockZip.file(CrtInternalFiles.student, "student");

      const blob = await mockZip.generateAsync({ type: "blob" });

      await expect(detectTaskFormat(blob)).rejects.toThrow(
        UnsupportedTaskFormatError,
      );
    });

    it("should detect CRT internal with empty required files", async () => {
      mockZip.file(CrtInternalFiles.template, "");
      mockZip.file(CrtInternalFiles.student, "");
      mockZip.file(CrtInternalFiles.autograder, "");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await detectTaskFormat(blob);

      expect(result).toBe(TaskFormat.CrtInternal);
    });
  });

  describe("External Custom format detection", () => {
    it("should detect external custom format with task file", async () => {
      mockZip.file(GenericNotebookFiles.task, "task content");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await detectTaskFormat(blob);

      expect(result).toBe(TaskFormat.GenericNotebook);
    });

    it("should not detect external custom when task file is missing", async () => {
      mockZip.file(`${GenericNotebookFiles.data}/data.txt`, "data");

      const blob = await mockZip.generateAsync({ type: "blob" });

      await expect(detectTaskFormat(blob)).rejects.toThrow(
        UnsupportedTaskFormatError,
      );
    });

    it("should detect external custom with empty task file", async () => {
      mockZip.file(GenericNotebookFiles.task, "");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await detectTaskFormat(blob);

      expect(result).toBe(TaskFormat.GenericNotebook);
    });
  });

  describe("Unknown format detection", () => {
    it("should throw error for empty ZIP", async () => {
      const blob = await mockZip.generateAsync({ type: "blob" });

      await expect(detectTaskFormat(blob)).rejects.toThrow(
        UnsupportedTaskFormatError,
      );
    });

    it("should throw error for ZIP with unrecognized structure", async () => {
      mockZip.file("random-file.txt", "content");
      mockZip.file("another-file.py", "code");

      const blob = await mockZip.generateAsync({ type: "blob" });

      await expect(detectTaskFormat(blob)).rejects.toThrow(
        UnsupportedTaskFormatError,
      );
    });
  });

  describe("error handling", () => {
    it("should throw InvalidTaskBlobError for invalid blob", async () => {
      const invalidBlob = new Blob(["not a zip"], { type: "text/plain" });

      await expect(detectTaskFormat(invalidBlob)).rejects.toThrow(
        InvalidTaskBlobError,
      );
    });

    it("should handle empty blob", async () => {
      const emptyBlob = new Blob([], { type: "application/zip" });

      await expect(detectTaskFormat(emptyBlob)).rejects.toThrow(
        InvalidTaskBlobError,
      );
    });
  });

  describe("ambiguity resolution", () => {
    it("should handle case-sensitive file names", async () => {
      mockZip.file("TASK.ipynb", "task");

      const blob = await mockZip.generateAsync({ type: "blob" });

      await expect(detectTaskFormat(blob)).rejects.toThrow(
        UnsupportedTaskFormatError,
      );
    });
  });

  describe("edge cases", () => {
    it("should handle ZIP with extra files alongside required files", async () => {
      mockZip.file(CrtInternalFiles.template, "template");
      mockZip.file(CrtInternalFiles.student, "student");
      mockZip.file(CrtInternalFiles.autograder, "autograder");
      mockZip.file("README.md", "readme");
      mockZip.file("thisisanextrafile.txt", "extra");

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await detectTaskFormat(blob);

      expect(result).toBe(TaskFormat.CrtInternal);
    });

    it("should handle binary files in ZIP", async () => {
      mockZip.file(GenericNotebookFiles.task, "task");
      const binaryData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
      mockZip.file(`${GenericNotebookFiles.data}/image.png`, binaryData);

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await detectTaskFormat(blob);

      expect(result).toBe(TaskFormat.GenericNotebook);
    });

    it("should handle files with special characters in names", async () => {
      mockZip.file(GenericNotebookFiles.task, "task");
      mockZip.file(
        `${GenericNotebookFiles.data}/file with spaces & special!.txt`,
        "content",
      );

      const blob = await mockZip.generateAsync({ type: "blob" });

      const result = await detectTaskFormat(blob);

      expect(result).toBe(TaskFormat.GenericNotebook);
    });

    it("should detect task format in nested directories in ZIP", async () => {
      mockZip.file("nested/folder/task.ipynb", "task");

      const blob = await mockZip.generateAsync({ type: "blob" });

      await expect(detectTaskFormat(blob)).rejects.toThrow(
        UnsupportedTaskFormatError,
      );
    });
  });
});
