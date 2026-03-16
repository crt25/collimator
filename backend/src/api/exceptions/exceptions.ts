import { ErrorCode } from "./error-codes";

export class ApiError extends Error {
  public errorCode?: ErrorCode;
  constructor(message?: string, errorCode?: ErrorCode) {
    super(message);
    this.errorCode = errorCode;
  }
}
