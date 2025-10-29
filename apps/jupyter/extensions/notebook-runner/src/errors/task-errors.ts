export class TaskError extends Error {}

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

    super(
      `${format} format is missing required files: ${missing.join(", ")}\n` +
        `Files found: ${actualFiles.join(", ")}`,
    );
  }
}

export class InvalidTaskBlobError extends TaskError {
  constructor(
    public readonly originalError?: Error,
    message?: string,
  ) {
    super(message || `Invalid task file: ${originalError}`);
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
  }
}

export class FolderAlreadyExistsError extends TaskError {
  constructor(public readonly path: string) {
    super(`Folder already exists at path: ${path}`);
  }
}

export class DirectoryNotFoundError extends TaskError {
  constructor(public readonly path: string) {
    super(`Directory not found at path: ${path}`);
  }
}

export class GenericNotebookTaskImportError extends TaskError {
  constructor() {
    super(`Cannot import external custom task in solve mode.`);
  }
}
