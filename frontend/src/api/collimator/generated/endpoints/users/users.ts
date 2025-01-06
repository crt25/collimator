/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import { fetchApi } from "../../../../fetch";
import type {
  CreateUserDto,
  DeletedUserDto,
  ExistingUserDto,
  RegistrationTokenDto,
  UpdateUserDto,
  UpdateUserKeyDto,
} from "../../models";

export const getUsersControllerCreateV0Url = () => {
  return `/api/v0/users`;
};

export const usersControllerCreateV0 = async (
  createUserDto: CreateUserDto,
  options?: RequestInit,
): Promise<ExistingUserDto> => {
  return fetchApi<Promise<ExistingUserDto>>(getUsersControllerCreateV0Url(), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(createUserDto),
  });
};

export const getUsersControllerFindAllV0Url = () => {
  return `/api/v0/users`;
};

export const usersControllerFindAllV0 = async (
  options?: RequestInit,
): Promise<ExistingUserDto[]> => {
  return fetchApi<Promise<ExistingUserDto[]>>(
    getUsersControllerFindAllV0Url(),
    {
      ...options,
      method: "GET",
    },
  );
};

export const getUsersControllerFindOneV0Url = (id: number) => {
  return `/api/v0/users/${id}`;
};

export const usersControllerFindOneV0 = async (
  id: number,
  options?: RequestInit,
): Promise<ExistingUserDto> => {
  return fetchApi<Promise<ExistingUserDto>>(
    getUsersControllerFindOneV0Url(id),
    {
      ...options,
      method: "GET",
    },
  );
};

export const getUsersControllerUpdateV0Url = (id: number) => {
  return `/api/v0/users/${id}`;
};

export const usersControllerUpdateV0 = async (
  id: number,
  updateUserDto: UpdateUserDto,
  options?: RequestInit,
): Promise<ExistingUserDto> => {
  return fetchApi<Promise<ExistingUserDto>>(getUsersControllerUpdateV0Url(id), {
    ...options,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(updateUserDto),
  });
};

export const getUsersControllerDeleteV0Url = (id: number) => {
  return `/api/v0/users/${id}`;
};

export const usersControllerDeleteV0 = async (
  id: number,
  options?: RequestInit,
): Promise<DeletedUserDto> => {
  return fetchApi<Promise<DeletedUserDto>>(getUsersControllerDeleteV0Url(id), {
    ...options,
    method: "DELETE",
  });
};

export const getUsersControllerUpdateKeyV0Url = (id: number) => {
  return `/api/v0/users/${id}/key`;
};

export const usersControllerUpdateKeyV0 = async (
  id: number,
  updateUserKeyDto: UpdateUserKeyDto,
  options?: RequestInit,
): Promise<number> => {
  return fetchApi<Promise<number>>(getUsersControllerUpdateKeyV0Url(id), {
    ...options,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(updateUserKeyDto),
  });
};

export const getUsersControllerCreateRegistrationTokenV0Url = (id: number) => {
  return `/api/v0/users/${id}/registration`;
};

export const usersControllerCreateRegistrationTokenV0 = async (
  id: number,
  options?: RequestInit,
): Promise<RegistrationTokenDto> => {
  return fetchApi<Promise<RegistrationTokenDto>>(
    getUsersControllerCreateRegistrationTokenV0Url(id),
    {
      ...options,
      method: "POST",
    },
  );
};
