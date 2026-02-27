import { ScratchProjectError } from "./base";
import { ScratchProjectErrorCode } from "./codes";

export class InvalidZipError extends ScratchProjectError {
  constructor(public originalError: Error) {
    super(
      ScratchProjectErrorCode.InvalidZip,
      "Invalid project file: not a valid ZIP archive",
    );
  }
}

export class MissingProjectJsonError extends ScratchProjectError {
  constructor() {
    super(
      ScratchProjectErrorCode.MissingProjectJson,
      "project.json missing from the ZIP",
    );
  }
}

export class InvalidProjectJsonError extends ScratchProjectError {
  constructor(public originalError: Error) {
    super(
      ScratchProjectErrorCode.InvalidProjectJson,
      "project.json is invalid JSON",
    );
  }
}

export class MissingAssetsError extends ScratchProjectError {
  constructor(public missingAssets: string[]) {
    super(
      ScratchProjectErrorCode.MissingAssets,
      `Project is missing ${missingAssets.length} assets`,
    );
  }
}

export class VmLoadError extends ScratchProjectError {
  constructor(public originalError: Error) {
    super(
      ScratchProjectErrorCode.VmLoadError,
      "Scratch VM failed to load project",
    );
  }
}

export class CrtConfigParseError extends ScratchProjectError {
  constructor(public originalError: Error) {
    super(
      ScratchProjectErrorCode.CrtConfigParseError,
      "crt.json is not valid JSON",
    );
  }
}

export class CannotExportProjectError extends ScratchProjectError {
  constructor(public originalError: unknown) {
    super(
      ScratchProjectErrorCode.CannotExportProject,
      "Failed to export the project",
    );
  }
}

export class CannotLoadProjectError extends ScratchProjectError {
  constructor(public originalError: unknown) {
    super(
      ScratchProjectErrorCode.CannotLoadProject,
      "Failed to load the project",
    );
  }
}

export class CannotSaveProjectError extends ScratchProjectError {
  constructor(public originalError: unknown) {
    super(
      ScratchProjectErrorCode.CannotSaveProject,
      "Failed to save the project",
    );
  }
}

export class TimeoutExceededError extends ScratchProjectError {
  constructor(public originalError: unknown) {
    super(
      ScratchProjectErrorCode.TimeoutExceeded,
      "Maximum execution time exceeded",
    );
  }
}

export class CannotGetTaskError extends ScratchProjectError {
  constructor(public originalError: unknown) {
    super(ScratchProjectErrorCode.CannotGetTask, "Failed to get the task");
  }
}
