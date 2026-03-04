import { ScratchProjectErrorCode } from "./codes";

export abstract class ScratchProjectError extends Error {
  constructor(
    public code: ScratchProjectErrorCode,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export abstract class ScratchInnerError extends ScratchProjectError {
  constructor(code: ScratchProjectErrorCode, defaultMessage: string) {
    super(code, defaultMessage);
  }
}

export abstract class ScratchWrapperError extends ScratchProjectError {
  constructor(code: ScratchProjectErrorCode, message: string) {
    super(code, message);
  }
}
