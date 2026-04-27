import { ErrorCode } from "@/api/collimator/generated/models";

export class ApiError extends Error {
  public readonly errorCode?: string;

  constructor(
    public readonly status: number,
    message: string,
    errorCode?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.errorCode = errorCode;
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "Conflict", errorCode?: string) {
    super(409, message, errorCode);
    this.name = "ConflictError";
  }
}

export const isApiErrorWithCode = (
  error: unknown,
  errorCode: ErrorCode,
): error is ApiError & { errorCode: ErrorCode } => {
  return error instanceof ApiError && error.errorCode === errorCode;
};
