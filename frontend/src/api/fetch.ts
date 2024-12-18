import { backendHostName } from "@/utilities/constants";

export const fetchApi = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const request = new Request(`${backendHostName}${url}`, options);
  const response = await fetch(request);

  if (response.status === 401) {
    // properly sign out the user
    window.location.href = "/logout";

    // never-resolving promise - this way the redirect will happen before
    // the UI knows about the error
    return new Promise<T>(() => {});
  }

  if (response.status >= 400) {
    throw new Error(`Unexpected response code ${response.status}`);
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
