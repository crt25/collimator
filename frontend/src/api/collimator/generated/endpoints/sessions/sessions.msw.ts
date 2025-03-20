/**
 * Generated by orval v7.6.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import { faker } from "@faker-js/faker";

import { HttpResponse, delay, http } from "msw";

import { SessionStatus, TaskProgress } from "../../models";
import type {
  DeletedSessionDto,
  ExistingSessionDto,
  ExistingSessionExtendedDto,
  IsSessionAnonymousDto,
  StudentSessionProgressDto,
} from "../../models";

export const getSessionsControllerCreateV0ResponseMock = (
  overrideResponse: Partial<ExistingSessionDto> = {},
): ExistingSessionDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
  title: faker.string.alpha(20),
  description: faker.string.alpha(20),
  isAnonymous: faker.datatype.boolean(),
  status: faker.helpers.arrayElement(Object.values(SessionStatus)),
  lesson: {
    ...{
      id: faker.number.int({ min: undefined, max: undefined }),
      name: faker.string.alpha(20),
    },
  },
  tasks: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => faker.number.int({ min: undefined, max: undefined })),
  ...overrideResponse,
});

export const getSessionsControllerFindAllV0ResponseMock =
  (): ExistingSessionDto[] =>
    Array.from(
      { length: faker.number.int({ min: 1, max: 10 }) },
      (_, i) => i + 1,
    ).map(() => ({
      id: faker.number.int({ min: undefined, max: undefined }),
      createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
      title: faker.string.alpha(20),
      description: faker.string.alpha(20),
      isAnonymous: faker.datatype.boolean(),
      status: faker.helpers.arrayElement(Object.values(SessionStatus)),
      lesson: {
        ...{
          id: faker.number.int({ min: undefined, max: undefined }),
          name: faker.string.alpha(20),
        },
      },
      tasks: Array.from(
        { length: faker.number.int({ min: 1, max: 10 }) },
        (_, i) => i + 1,
      ).map(() => faker.number.int({ min: undefined, max: undefined })),
    }));

export const getSessionsControllerIsAnonymousV0ResponseMock = (
  overrideResponse: Partial<IsSessionAnonymousDto> = {},
): IsSessionAnonymousDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  isAnonymous: faker.datatype.boolean(),
  ...overrideResponse,
});

export const getSessionsControllerFindOneV0ResponseMock = (
  overrideResponse: Partial<ExistingSessionExtendedDto> = {},
): ExistingSessionExtendedDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
  title: faker.string.alpha(20),
  description: faker.string.alpha(20),
  isAnonymous: faker.datatype.boolean(),
  status: faker.helpers.arrayElement(Object.values(SessionStatus)),
  lesson: {
    ...{
      id: faker.number.int({ min: undefined, max: undefined }),
      name: faker.string.alpha(20),
    },
  },
  class: {
    ...{
      id: faker.number.int({ min: undefined, max: undefined }),
      name: faker.string.alpha(20),
    },
  },
  tasks: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => ({
    id: faker.number.int({ min: undefined, max: undefined }),
    title: faker.string.alpha(20),
  })),
  ...overrideResponse,
});

export const getSessionsControllerUpdateV0ResponseMock = (
  overrideResponse: Partial<ExistingSessionDto> = {},
): ExistingSessionDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
  title: faker.string.alpha(20),
  description: faker.string.alpha(20),
  isAnonymous: faker.datatype.boolean(),
  status: faker.helpers.arrayElement(Object.values(SessionStatus)),
  lesson: {
    ...{
      id: faker.number.int({ min: undefined, max: undefined }),
      name: faker.string.alpha(20),
    },
  },
  tasks: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => faker.number.int({ min: undefined, max: undefined })),
  ...overrideResponse,
});

export const getSessionsControllerRemoveV0ResponseMock = (
  overrideResponse: Partial<DeletedSessionDto> = {},
): DeletedSessionDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
  title: faker.string.alpha(20),
  description: faker.string.alpha(20),
  isAnonymous: faker.datatype.boolean(),
  status: faker.helpers.arrayElement(Object.values(SessionStatus)),
  lesson: {
    ...{
      id: faker.number.int({ min: undefined, max: undefined }),
      name: faker.string.alpha(20),
    },
  },
  tasks: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => faker.number.int({ min: undefined, max: undefined })),
  ...overrideResponse,
});

export const getSessionsControllerStartV0ResponseMock = (
  overrideResponse: Partial<ExistingSessionDto> = {},
): ExistingSessionDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
  title: faker.string.alpha(20),
  description: faker.string.alpha(20),
  isAnonymous: faker.datatype.boolean(),
  status: faker.helpers.arrayElement(Object.values(SessionStatus)),
  lesson: {
    ...{
      id: faker.number.int({ min: undefined, max: undefined }),
      name: faker.string.alpha(20),
    },
  },
  tasks: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => faker.number.int({ min: undefined, max: undefined })),
  ...overrideResponse,
});

export const getSessionsControllerPauseV0ResponseMock = (
  overrideResponse: Partial<ExistingSessionDto> = {},
): ExistingSessionDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
  title: faker.string.alpha(20),
  description: faker.string.alpha(20),
  isAnonymous: faker.datatype.boolean(),
  status: faker.helpers.arrayElement(Object.values(SessionStatus)),
  lesson: {
    ...{
      id: faker.number.int({ min: undefined, max: undefined }),
      name: faker.string.alpha(20),
    },
  },
  tasks: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => faker.number.int({ min: undefined, max: undefined })),
  ...overrideResponse,
});

export const getSessionsControllerFinishV0ResponseMock = (
  overrideResponse: Partial<ExistingSessionDto> = {},
): ExistingSessionDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
  title: faker.string.alpha(20),
  description: faker.string.alpha(20),
  isAnonymous: faker.datatype.boolean(),
  status: faker.helpers.arrayElement(Object.values(SessionStatus)),
  lesson: {
    ...{
      id: faker.number.int({ min: undefined, max: undefined }),
      name: faker.string.alpha(20),
    },
  },
  tasks: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => faker.number.int({ min: undefined, max: undefined })),
  ...overrideResponse,
});

export const getSessionsControllerGetSessionProgressV0ResponseMock = (
  overrideResponse: Partial<StudentSessionProgressDto> = {},
): StudentSessionProgressDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  taskProgress: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => ({
    id: faker.number.int({ min: undefined, max: undefined }),
    taskProgress: faker.helpers.arrayElement(Object.values(TaskProgress)),
  })),
  ...overrideResponse,
});

export const getSessionsControllerCreateV0MockHandler = (
  overrideResponse?:
    | ExistingSessionDto
    | ((
        info: Parameters<Parameters<typeof http.post>[1]>[0],
      ) => Promise<ExistingSessionDto> | ExistingSessionDto),
) => {
  return http.post("*/api/v0/classes/:classId/sessions", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getSessionsControllerCreateV0ResponseMock(),
      ),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getSessionsControllerFindAllV0MockHandler = (
  overrideResponse?:
    | ExistingSessionDto[]
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<ExistingSessionDto[]> | ExistingSessionDto[]),
) => {
  return http.get("*/api/v0/classes/:classId/sessions", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getSessionsControllerFindAllV0ResponseMock(),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getSessionsControllerIsAnonymousV0MockHandler = (
  overrideResponse?:
    | IsSessionAnonymousDto
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<IsSessionAnonymousDto> | IsSessionAnonymousDto),
) => {
  return http.get(
    "*/api/v0/classes/:classId/sessions/:id/is-anonymous",
    async (info) => {
      await delay(1000);

      return new HttpResponse(
        JSON.stringify(
          overrideResponse !== undefined
            ? typeof overrideResponse === "function"
              ? await overrideResponse(info)
              : overrideResponse
            : getSessionsControllerIsAnonymousV0ResponseMock(),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};

export const getSessionsControllerFindOneV0MockHandler = (
  overrideResponse?:
    | ExistingSessionExtendedDto
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<ExistingSessionExtendedDto> | ExistingSessionExtendedDto),
) => {
  return http.get("*/api/v0/classes/:classId/sessions/:id", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getSessionsControllerFindOneV0ResponseMock(),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getSessionsControllerUpdateV0MockHandler = (
  overrideResponse?:
    | ExistingSessionDto
    | ((
        info: Parameters<Parameters<typeof http.patch>[1]>[0],
      ) => Promise<ExistingSessionDto> | ExistingSessionDto),
) => {
  return http.patch("*/api/v0/classes/:classId/sessions/:id", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getSessionsControllerUpdateV0ResponseMock(),
      ),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getSessionsControllerRemoveV0MockHandler = (
  overrideResponse?:
    | DeletedSessionDto
    | ((
        info: Parameters<Parameters<typeof http.delete>[1]>[0],
      ) => Promise<DeletedSessionDto> | DeletedSessionDto),
) => {
  return http.delete("*/api/v0/classes/:classId/sessions/:id", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getSessionsControllerRemoveV0ResponseMock(),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getSessionsControllerStartV0MockHandler = (
  overrideResponse?:
    | ExistingSessionDto
    | ((
        info: Parameters<Parameters<typeof http.post>[1]>[0],
      ) => Promise<ExistingSessionDto> | ExistingSessionDto),
) => {
  return http.post(
    "*/api/v0/classes/:classId/sessions/:id/start",
    async (info) => {
      await delay(1000);

      return new HttpResponse(
        JSON.stringify(
          overrideResponse !== undefined
            ? typeof overrideResponse === "function"
              ? await overrideResponse(info)
              : overrideResponse
            : getSessionsControllerStartV0ResponseMock(),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};

export const getSessionsControllerPauseV0MockHandler = (
  overrideResponse?:
    | ExistingSessionDto
    | ((
        info: Parameters<Parameters<typeof http.post>[1]>[0],
      ) => Promise<ExistingSessionDto> | ExistingSessionDto),
) => {
  return http.post(
    "*/api/v0/classes/:classId/sessions/:id/pause",
    async (info) => {
      await delay(1000);

      return new HttpResponse(
        JSON.stringify(
          overrideResponse !== undefined
            ? typeof overrideResponse === "function"
              ? await overrideResponse(info)
              : overrideResponse
            : getSessionsControllerPauseV0ResponseMock(),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};

export const getSessionsControllerFinishV0MockHandler = (
  overrideResponse?:
    | ExistingSessionDto
    | ((
        info: Parameters<Parameters<typeof http.post>[1]>[0],
      ) => Promise<ExistingSessionDto> | ExistingSessionDto),
) => {
  return http.post(
    "*/api/v0/classes/:classId/sessions/:id/finish",
    async (info) => {
      await delay(1000);

      return new HttpResponse(
        JSON.stringify(
          overrideResponse !== undefined
            ? typeof overrideResponse === "function"
              ? await overrideResponse(info)
              : overrideResponse
            : getSessionsControllerFinishV0ResponseMock(),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};

export const getSessionsControllerGetSessionProgressV0MockHandler = (
  overrideResponse?:
    | StudentSessionProgressDto
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<StudentSessionProgressDto> | StudentSessionProgressDto),
) => {
  return http.get(
    "*/api/v0/classes/:classId/sessions/:id/progress",
    async (info) => {
      await delay(1000);

      return new HttpResponse(
        JSON.stringify(
          overrideResponse !== undefined
            ? typeof overrideResponse === "function"
              ? await overrideResponse(info)
              : overrideResponse
            : getSessionsControllerGetSessionProgressV0ResponseMock(),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};
export const getSessionsMock = () => [
  getSessionsControllerCreateV0MockHandler(),
  getSessionsControllerFindAllV0MockHandler(),
  getSessionsControllerIsAnonymousV0MockHandler(),
  getSessionsControllerFindOneV0MockHandler(),
  getSessionsControllerUpdateV0MockHandler(),
  getSessionsControllerRemoveV0MockHandler(),
  getSessionsControllerStartV0MockHandler(),
  getSessionsControllerPauseV0MockHandler(),
  getSessionsControllerFinishV0MockHandler(),
  getSessionsControllerGetSessionProgressV0MockHandler(),
];
