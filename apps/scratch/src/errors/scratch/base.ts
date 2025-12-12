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
