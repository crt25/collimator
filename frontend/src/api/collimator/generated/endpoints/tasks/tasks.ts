/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import type {
  CreateTaskDto,
  DeletedTaskDto,
  ExistingTaskDto,
  UpdateTaskDto,
} from "../../models";
import { fetchApi } from "../../../../fetch";

export const getTasksControllerCreateV0Url = () => {
  return `/api/v0/tasks`;
};

export const tasksControllerCreateV0 = async (
  createTaskDto: CreateTaskDto,
  options?: RequestInit,
): Promise<ExistingTaskDto> => {
  return fetchApi<Promise<ExistingTaskDto>>(getTasksControllerCreateV0Url(), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(createTaskDto),
  });
};

export const getTasksControllerFindAllV0Url = () => {
  return `/api/v0/tasks`;
};

export const tasksControllerFindAllV0 = async (
  options?: RequestInit,
): Promise<ExistingTaskDto[]> => {
  return fetchApi<Promise<ExistingTaskDto[]>>(
    getTasksControllerFindAllV0Url(),
    {
      ...options,
      method: "GET",
    },
  );
};

export const getTasksControllerFindOneV0Url = (id: number) => {
  return `/api/v0/tasks/${id}`;
};

export const tasksControllerFindOneV0 = async (
  id: number,
  options?: RequestInit,
): Promise<ExistingTaskDto> => {
  return fetchApi<Promise<ExistingTaskDto>>(
    getTasksControllerFindOneV0Url(id),
    {
      ...options,
      method: "GET",
    },
  );
};

export const getTasksControllerUpdateV0Url = (id: number) => {
  return `/api/v0/tasks/${id}`;
};

export const tasksControllerUpdateV0 = async (
  id: number,
  updateTaskDto: UpdateTaskDto,
  options?: RequestInit,
): Promise<ExistingTaskDto> => {
  return fetchApi<Promise<ExistingTaskDto>>(getTasksControllerUpdateV0Url(id), {
    ...options,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(updateTaskDto),
  });
};

export const getTasksControllerRemoveV0Url = (id: number) => {
  return `/api/v0/tasks/${id}`;
};

export const tasksControllerRemoveV0 = async (
  id: number,
  options?: RequestInit,
): Promise<DeletedTaskDto> => {
  return fetchApi<Promise<DeletedTaskDto>>(getTasksControllerRemoveV0Url(id), {
    ...options,
    method: "DELETE",
  });
};

export const getTasksControllerDownloadOneV0Url = (id: number) => {
  return `/api/v0/tasks/${id}/download`;
};

export const tasksControllerDownloadOneV0 = async (
  id: number,
  options?: RequestInit,
): Promise<void> => {
  return fetchApi<Promise<void>>(getTasksControllerDownloadOneV0Url(id), {
    ...options,
    method: "GET",
  });
};
