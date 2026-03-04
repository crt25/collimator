import { ScratchWrapperError } from "./base";
import { ScratchProjectErrorCode } from "./codes";

export class CannotExportProjectError extends ScratchWrapperError {
  constructor(message: string) {
    super(ScratchProjectErrorCode.CannotExportProject, message);
  }
}

export class CannotLoadProjectError extends ScratchWrapperError {
  constructor(message: string) {
    super(ScratchProjectErrorCode.CannotLoadProject, message);
  }
}

export class CannotSaveProjectError extends ScratchWrapperError {
  constructor(message: string) {
    super(ScratchProjectErrorCode.CannotSaveProject, message);
  }
}

export class TimeoutExceededError extends ScratchWrapperError {
  constructor(message: string) {
    super(ScratchProjectErrorCode.TimeoutExceeded, message);
  }
}

export class CannotGetTaskError extends ScratchWrapperError {
  constructor(message: string) {
    super(ScratchProjectErrorCode.CannotGetTask, message);
  }
}
