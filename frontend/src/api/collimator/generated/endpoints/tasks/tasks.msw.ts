/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import { faker } from "@faker-js/faker";
import { HttpResponse, delay, http } from "msw";
import { TaskType } from "../../models";
import type { DeletedTaskDto, ExistingTaskDto } from "../../models";

export const getTasksControllerCreateV0ResponseMock = (
  overrideResponse: Partial<ExistingTaskDto> = {},
): ExistingTaskDto => ({
  creatorId: faker.number.int({ min: undefined, max: undefined }),
  description: faker.word.sample(),
  file: new Blob(faker.helpers.arrayElements(faker.word.words(10).split(" "))),
  id: faker.number.int({ min: undefined, max: undefined }),
  title: faker.word.sample(),
  type: faker.helpers.arrayElement([
    faker.helpers.arrayElement(Object.values(TaskType)),
  ]),
  ...overrideResponse,
});

export const getTasksControllerFindAllV0ResponseMock = (): ExistingTaskDto[] =>
  Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => ({
    creatorId: faker.number.int({ min: undefined, max: undefined }),
    description: faker.word.sample(),
    file: new Blob(
      faker.helpers.arrayElements(faker.word.words(10).split(" ")),
    ),
    id: faker.number.int({ min: undefined, max: undefined }),
    title: faker.word.sample(),
    type: faker.helpers.arrayElement([
      faker.helpers.arrayElement(Object.values(TaskType)),
    ]),
  }));

export const getTasksControllerFindOneV0ResponseMock = (
  overrideResponse: Partial<ExistingTaskDto> = {},
): ExistingTaskDto => ({
  creatorId: faker.number.int({ min: undefined, max: undefined }),
  description: faker.word.sample(),
  file: new Blob(faker.helpers.arrayElements(faker.word.words(10).split(" "))),
  id: faker.number.int({ min: undefined, max: undefined }),
  title: faker.word.sample(),
  type: faker.helpers.arrayElement([
    faker.helpers.arrayElement(Object.values(TaskType)),
  ]),
  ...overrideResponse,
});

export const getTasksControllerUpdateV0ResponseMock = (
  overrideResponse: Partial<ExistingTaskDto> = {},
): ExistingTaskDto => ({
  creatorId: faker.number.int({ min: undefined, max: undefined }),
  description: faker.word.sample(),
  file: new Blob(faker.helpers.arrayElements(faker.word.words(10).split(" "))),
  id: faker.number.int({ min: undefined, max: undefined }),
  title: faker.word.sample(),
  type: faker.helpers.arrayElement([
    faker.helpers.arrayElement(Object.values(TaskType)),
  ]),
  ...overrideResponse,
});

export const getTasksControllerRemoveV0ResponseMock = (
  overrideResponse: Partial<DeletedTaskDto> = {},
): DeletedTaskDto => ({
  creatorId: faker.number.int({ min: undefined, max: undefined }),
  description: faker.word.sample(),
  file: new Blob(faker.helpers.arrayElements(faker.word.words(10).split(" "))),
  id: faker.number.int({ min: undefined, max: undefined }),
  title: faker.word.sample(),
  type: faker.helpers.arrayElement([
    faker.helpers.arrayElement(Object.values(TaskType)),
  ]),
  ...overrideResponse,
});

export const getTasksControllerUpdateFileV0ResponseMock = (
  overrideResponse: Partial<ExistingTaskDto> = {},
): ExistingTaskDto => ({
  creatorId: faker.number.int({ min: undefined, max: undefined }),
  description: faker.word.sample(),
  file: new Blob(faker.helpers.arrayElements(faker.word.words(10).split(" "))),
  id: faker.number.int({ min: undefined, max: undefined }),
  title: faker.word.sample(),
  type: faker.helpers.arrayElement([
    faker.helpers.arrayElement(Object.values(TaskType)),
  ]),
  ...overrideResponse,
});

export const getTasksControllerCreateV0MockHandler = (
  overrideResponse?:
    | ExistingTaskDto
    | ((
        info: Parameters<Parameters<typeof http.post>[1]>[0],
      ) => Promise<ExistingTaskDto> | ExistingTaskDto),
) => {
  return http.post("*/api/v0/tasks", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getTasksControllerCreateV0ResponseMock(),
      ),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getTasksControllerFindAllV0MockHandler = (
  overrideResponse?:
    | ExistingTaskDto[]
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<ExistingTaskDto[]> | ExistingTaskDto[]),
) => {
  return http.get("*/api/v0/tasks", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getTasksControllerFindAllV0ResponseMock(),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getTasksControllerFindOneV0MockHandler = (
  overrideResponse?:
    | ExistingTaskDto
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<ExistingTaskDto> | ExistingTaskDto),
) => {
  return http.get("*/api/v0/tasks/:id", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getTasksControllerFindOneV0ResponseMock(),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getTasksControllerUpdateV0MockHandler = (
  overrideResponse?:
    | ExistingTaskDto
    | ((
        info: Parameters<Parameters<typeof http.patch>[1]>[0],
      ) => Promise<ExistingTaskDto> | ExistingTaskDto),
) => {
  return http.patch("*/api/v0/tasks/:id", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getTasksControllerUpdateV0ResponseMock(),
      ),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getTasksControllerRemoveV0MockHandler = (
  overrideResponse?:
    | DeletedTaskDto
    | ((
        info: Parameters<Parameters<typeof http.delete>[1]>[0],
      ) => Promise<DeletedTaskDto> | DeletedTaskDto),
) => {
  return http.delete("*/api/v0/tasks/:id", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getTasksControllerRemoveV0ResponseMock(),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getTasksControllerDownloadOneV0MockHandler = (
  overrideResponse?:
    | void
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<void> | void),
) => {
  return http.get("*/api/v0/tasks/:id/download", async (info) => {
    await delay(1000);
    if (typeof overrideResponse === "function") {
      await overrideResponse(info);
    }
    return new HttpResponse(null, { status: 200 });
  });
};

export const getTasksControllerUpdateFileV0MockHandler = (
  overrideResponse?:
    | ExistingTaskDto
    | ((
        info: Parameters<Parameters<typeof http.patch>[1]>[0],
      ) => Promise<ExistingTaskDto> | ExistingTaskDto),
) => {
  return http.patch("*/api/v0/tasks/:id/file", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getTasksControllerUpdateFileV0ResponseMock(),
      ),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  });
};
export const getTasksMock = () => [
  getTasksControllerCreateV0MockHandler(),
  getTasksControllerFindAllV0MockHandler(),
  getTasksControllerFindOneV0MockHandler(),
  getTasksControllerUpdateV0MockHandler(),
  getTasksControllerRemoveV0MockHandler(),
  getTasksControllerDownloadOneV0MockHandler(),
  getTasksControllerUpdateFileV0MockHandler(),
];
