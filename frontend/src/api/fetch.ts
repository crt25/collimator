import { authenticationStateKey, backendHostName } from "@/utilities/constants";

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

export const fetchApi = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const request = new Request(`${backendHostName}${url}`, options);
  const response = await fetch(request);

  if (response.status === 401) {
    // properly sign out the user
    window.location.href = "/logout";
    // clear local storage auth entry
    localStorage.removeItem(authenticationStateKey);

    // never-resolving promise - this way the redirect will happen before
    // the UI knows about the error
    return new Promise<T>(() => {});
  }

  if (response.status === 409) {
    const errorBody = await response.json();
    throw new ConflictError(
      errorBody?.message,
      // Hardcoded to avoid importing from generated models - orval parses this
      // file as a mutator before generation, causing errors if it imports
      // the ErrorCode enum from the generated output folder.
      errorBody?.errorCode || "GENERIC_ERROR",
    );
  }

  if (response.status >= 400) {
    throw new ApiError(
      response.status,
      `Unexpected response code ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const fetchFile = async (
  url: string,
  options: RequestInit,
): Promise<Blob> => {
  const request = new Request(`${backendHostName}${url}`, options);
  const response = await fetch(request);

  if (response.status !== 200) {
    throw new Error("Could not fetch file");
  }

  return response.blob();
};
