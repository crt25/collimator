import { ScratchProjectError } from "./base";
import { ScratchProjectErrorCode } from "./codes";

export class InvalidZipError extends ScratchProjectError {
  constructor(public message: string) {
    super(ScratchProjectErrorCode.InvalidZip, message);
  }
}

export class MissingProjectJsonError extends ScratchProjectError {
  constructor(public message: string) {
    super(ScratchProjectErrorCode.MissingProjectJson, message);
  }
}

export class InvalidProjectJsonError extends ScratchProjectError {
  constructor(public message: string) {
    super(ScratchProjectErrorCode.InvalidProjectJson, message);
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
  constructor(public message: string) {
    super(ScratchProjectErrorCode.VmLoadError, message);
  }
}

export class CrtConfigParseError extends ScratchProjectError {
  constructor(public message: string) {
    super(ScratchProjectErrorCode.CrtConfigParseError, message);
  }
}

export class CannotExportProjectError extends ScratchProjectError {
  constructor(public message: string) {
    super(ScratchProjectErrorCode.CannotExportProject, message);
  }
}

export class CannotLoadProjectError extends ScratchProjectError {
  constructor(public message: string) {
    super(ScratchProjectErrorCode.CannotLoadProject, message);
  }
}

export class CannotSaveProjectError extends ScratchProjectError {
  constructor(public message: string) {
    super(ScratchProjectErrorCode.CannotSaveProject, message);
  }
}

export class TimeoutExceededError extends ScratchProjectError {
  constructor(public message: string) {
    super(ScratchProjectErrorCode.TimeoutExceeded, message);
  }
}

export class CannotGetTaskError extends ScratchProjectError {
  constructor(public message: string) {
    super(ScratchProjectErrorCode.CannotGetTask, message);
  }
}
