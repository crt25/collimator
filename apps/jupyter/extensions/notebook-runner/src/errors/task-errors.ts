import { FileSystemOperation } from "../task-converter";

export abstract class TaskError extends Error {}

export class UnsupportedTaskFormatError extends TaskError {
  constructor(public readonly availableFiles: string[]) {
    const message =
      `Unrecognized task format. Please ensure the file is either:\n` +
      `1. A CRT export (contains template.ipynb, student.ipynb, autograder.zip), or\n` +
      `2. A custom task package (contains task.ipynb)\n\n` +
      `Files found: ${availableFiles.join(", ")}`;

    super(message);
  }
}

export class MissingRequiredFilesError extends TaskError {
  constructor(
    public readonly format: string,
    public readonly requiredFiles: string[],
    public readonly actualFiles: string[],
  ) {
    const missing = requiredFiles.filter(
      (required) => !actualFiles.includes(required),
    );

    const message =
      `${format} format is missing required files: ${missing.join(", ")}\n` +
      `Files found: ${actualFiles.join(", ")}`;
    super(message);
  }
}

export class InvalidTaskBlobError extends TaskError {
  constructor(cause: Error | unknown | null) {
    const message =
      cause instanceof Error
        ? `Invalid task file: ${cause.message}`
        : `Invalid task file: Unknown error`;

    super(message);
  }
}

export class InvalidModeError extends TaskError {
  constructor(
    public readonly attemptedFormat: string,
    public readonly currentMode: string,
  ) {
    const message =
      `Cannot import ${attemptedFormat} format in ${currentMode} mode. ` +
      `External custom format can only be imported in edit mode. ` +
      `Please generate student task and autograder first by exporting in edit mode.`;

    super(message);
  }
}

export class FileSystemError extends TaskError {
  constructor(
    public readonly operation: FileSystemOperation,
    public readonly path: string,
    cause: unknown,
  ) {
    const message =
      cause instanceof Error
        ? `Failed to ${operation} file at ${path}` + `: ${cause.message}`
        : `Failed to ${operation} file at ${path}` + `: Unknown error`;

    super(message);
  }
}

export class DirectoryNotFoundError extends TaskError {
  constructor(public readonly path: string) {
    const message = `Directory not found at path: ${path}`;
    super(message);
  }
}

export class FileNotFoundError extends TaskError {
  constructor(public readonly path: string) {
    const message = `File not found at path: ${path}`;
    super(message);
  }
}

export class GenericNotebookTaskImportError extends TaskError {
  constructor() {
    const message = `Cannot import external custom task in solve mode.`;
    super(message);
  }
}

export class UnexpectedFileTypeError extends TaskError {
  constructor(
    public readonly path: string,
    public readonly expectedType: string,
  ) {
    const message = `Unexpected file type at path: ${path}. Expected type: ${expectedType}.`;
    super(message);
  }
}

export class UnexpectedFileError extends UnexpectedFileTypeError {
  constructor(public readonly path: string) {
    super(path, "file");
  }
}

export class ExportError extends TaskError {
  constructor(public readonly reason: string) {
    super(`Failed to export task: ${reason}`);
  }
}

export class GetTaskError extends TaskError {
  constructor(public readonly reason: string) {
    super(`Failed to get task: ${reason}`);
  }
}
