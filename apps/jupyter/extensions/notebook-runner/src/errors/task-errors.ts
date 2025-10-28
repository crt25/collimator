export class TaskError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskError";
    Object.setPrototypeOf(this, TaskError.prototype);
  }
}

export class UnsupportedTaskFormatError extends TaskError {
  constructor(
    public readonly availableFiles: string[],
    message?: string,
  ) {
    super(
      message ||
        `Unrecognized task format. Please ensure the file is either:\n` +
          `1. A CRT export (contains template.ipynb, student.ipynb, autograder.zip), or\n` +
          `2. A custom task package (contains task.ipynb)\n\n` +
          `Files found: ${availableFiles.join(", ")}`,
    );
    this.name = "UnsupportedTaskFormatError";
    Object.setPrototypeOf(this, UnsupportedTaskFormatError.prototype);
  }
}

export class MissingRequiredFilesError extends TaskError {
  constructor(
    public readonly format: string,
    public readonly missingFiles: string[],
    public readonly availableFiles: string[],
  ) {
    super(
      `${format} format is missing required files: ${missingFiles.join(", ")}\n` +
        `Files found: ${availableFiles.join(", ")}`,
    );
    this.name = "MissingRequiredFilesError";
    Object.setPrototypeOf(this, MissingRequiredFilesError.prototype);
  }
}

export class InvalidTaskBlobError extends TaskError {
  constructor(
    public readonly reason: string,
    message?: string,
  ) {
    super(message || `Invalid task file: ${reason}`);
    this.name = "InvalidTaskBlobError";
    Object.setPrototypeOf(this, InvalidTaskBlobError.prototype);
  }
}

export class InvalidModeError extends TaskError {
  constructor(
    public readonly attemptedFormat: string,
    public readonly currentMode: string,
  ) {
    super(
      `Cannot import ${attemptedFormat} format in ${currentMode} mode. ` +
        `External custom format can only be imported in edit mode. ` +
        `Please generate student task and autograder first by exporting in edit mode.`,
    );
    this.name = "InvalidModeError";
    Object.setPrototypeOf(this, InvalidModeError.prototype);
  }
}

export class FileSystemError extends TaskError {
  constructor(
    public readonly operation: string,
    public readonly path: string,
    public readonly originalError?: Error,
  ) {
    super(
      `Failed to ${operation} file at ${path}` +
        (originalError ? `: ${originalError.message}` : ""),
    );
    this.name = "FileSystemError";
    Object.setPrototypeOf(this, FileSystemError.prototype);
  }
}

export class FolderAlreadyExistsError extends TaskError {
  constructor(public readonly path: string) {
    super(`Folder already exists at path: ${path}`);
    this.name = "FolderAlreadyExistsError";
    Object.setPrototypeOf(this, FolderAlreadyExistsError.prototype);
  }
}

export class DirectoryNotFoundError extends TaskError {
  constructor(public readonly path: string) {
    super(`Directory not found at path: ${path}`);
    this.name = "DirectoryNotFoundError";
    Object.setPrototypeOf(this, DirectoryNotFoundError.prototype);
  }
}
