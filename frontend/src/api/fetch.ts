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
  }

  return response.json() as T;
};

export const fetchFile = async (
  url: string,
  options: RequestInit,
): Promise<Blob> => {
  const request = new Request(`${backendHostName}${url}`, options);
  const response = await fetch(request);

  return response.blob();
};
