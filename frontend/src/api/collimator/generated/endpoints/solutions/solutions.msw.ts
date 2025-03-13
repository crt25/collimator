/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import { faker } from "@faker-js/faker";
import { HttpResponse, delay, http } from "msw";
import type { CurrentAnalysisDto, ExistingSolutionDto } from "../../models";

export const getSolutionsControllerCreateV0ResponseMock = (
  overrideResponse: Partial<ExistingSolutionDto> = {},
): ExistingSolutionDto => ({
  createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
  id: faker.number.int({ min: undefined, max: undefined }),
  sessionId: faker.number.int({ min: undefined, max: undefined }),
  studentId: faker.number.int({ min: undefined, max: undefined }),
  taskId: faker.number.int({ min: undefined, max: undefined }),
  tests: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => ({
    contextName: faker.helpers.arrayElement([faker.word.sample(), null]),
    identifier: faker.helpers.arrayElement([faker.word.sample(), null]),
    name: faker.word.sample(),
    passed: faker.datatype.boolean(),
  })),
  ...overrideResponse,
});

export const getSolutionsControllerFindAllV0ResponseMock =
  (): ExistingSolutionDto[] =>
    Array.from(
      { length: faker.number.int({ min: 1, max: 10 }) },
      (_, i) => i + 1,
    ).map(() => ({
      createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
      id: faker.number.int({ min: undefined, max: undefined }),
      sessionId: faker.number.int({ min: undefined, max: undefined }),
      studentId: faker.number.int({ min: undefined, max: undefined }),
      taskId: faker.number.int({ min: undefined, max: undefined }),
      tests: Array.from(
        { length: faker.number.int({ min: 1, max: 10 }) },
        (_, i) => i + 1,
      ).map(() => ({
        contextName: faker.helpers.arrayElement([faker.word.sample(), null]),
        identifier: faker.helpers.arrayElement([faker.word.sample(), null]),
        name: faker.word.sample(),
        passed: faker.datatype.boolean(),
      })),
    }));

export const getSolutionsControllerFindCurrentAnalysisV0ResponseMock =
  (): CurrentAnalysisDto[] =>
    Array.from(
      { length: faker.number.int({ min: 1, max: 10 }) },
      (_, i) => i + 1,
    ).map(() => ({
      genericAst: faker.word.sample(),
      id: faker.number.int({ min: undefined, max: undefined }),
      solutionId: faker.number.int({ min: undefined, max: undefined }),
      studentKeyPairId: faker.helpers.arrayElement([
        faker.number.int({ min: undefined, max: undefined }),
        null,
      ]),
      studentPseudonym: faker.word.sample(),
      tests: Array.from(
        { length: faker.number.int({ min: 1, max: 10 }) },
        (_, i) => i + 1,
      ).map(() => ({
        contextName: faker.helpers.arrayElement([faker.word.sample(), null]),
        identifier: faker.helpers.arrayElement([faker.word.sample(), null]),
        name: faker.word.sample(),
        passed: faker.datatype.boolean(),
      })),
    }));

export const getSolutionsControllerLatestSolutionV0ResponseMock = (
  overrideResponse: Partial<ExistingSolutionDto> = {},
): ExistingSolutionDto => ({
  createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
  id: faker.number.int({ min: undefined, max: undefined }),
  sessionId: faker.number.int({ min: undefined, max: undefined }),
  studentId: faker.number.int({ min: undefined, max: undefined }),
  taskId: faker.number.int({ min: undefined, max: undefined }),
  tests: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => ({
    contextName: faker.helpers.arrayElement([faker.word.sample(), null]),
    identifier: faker.helpers.arrayElement([faker.word.sample(), null]),
    name: faker.word.sample(),
    passed: faker.datatype.boolean(),
  })),
  ...overrideResponse,
});

export const getSolutionsControllerFindOneV0ResponseMock = (
  overrideResponse: Partial<ExistingSolutionDto> = {},
): ExistingSolutionDto => ({
  createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
  id: faker.number.int({ min: undefined, max: undefined }),
  sessionId: faker.number.int({ min: undefined, max: undefined }),
  studentId: faker.number.int({ min: undefined, max: undefined }),
  taskId: faker.number.int({ min: undefined, max: undefined }),
  tests: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => ({
    contextName: faker.helpers.arrayElement([faker.word.sample(), null]),
    identifier: faker.helpers.arrayElement([faker.word.sample(), null]),
    name: faker.word.sample(),
    passed: faker.datatype.boolean(),
  })),
  ...overrideResponse,
});

export const getSolutionsControllerCreateV0MockHandler = (
  overrideResponse?:
    | ExistingSolutionDto
    | ((
        info: Parameters<Parameters<typeof http.post>[1]>[0],
      ) => Promise<ExistingSolutionDto> | ExistingSolutionDto),
) => {
  return http.post(
    "*/api/v0/classes/:classId/sessions/:sessionId/task/:taskId/solutions",
    async (info) => {
      await delay(1000);

      return new HttpResponse(
        JSON.stringify(
          overrideResponse !== undefined
            ? typeof overrideResponse === "function"
              ? await overrideResponse(info)
              : overrideResponse
            : getSolutionsControllerCreateV0ResponseMock(),
        ),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};

export const getSolutionsControllerFindAllV0MockHandler = (
  overrideResponse?:
    | ExistingSolutionDto[]
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<ExistingSolutionDto[]> | ExistingSolutionDto[]),
) => {
  return http.get(
    "*/api/v0/classes/:classId/sessions/:sessionId/task/:taskId/solutions",
    async (info) => {
      await delay(1000);

      return new HttpResponse(
        JSON.stringify(
          overrideResponse !== undefined
            ? typeof overrideResponse === "function"
              ? await overrideResponse(info)
              : overrideResponse
            : getSolutionsControllerFindAllV0ResponseMock(),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};

export const getSolutionsControllerFindCurrentAnalysisV0MockHandler = (
  overrideResponse?:
    | CurrentAnalysisDto[]
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<CurrentAnalysisDto[]> | CurrentAnalysisDto[]),
) => {
  return http.get(
    "*/api/v0/classes/:classId/sessions/:sessionId/task/:taskId/solutions/current-analyses",
    async (info) => {
      await delay(1000);

      return new HttpResponse(
        JSON.stringify(
          overrideResponse !== undefined
            ? typeof overrideResponse === "function"
              ? await overrideResponse(info)
              : overrideResponse
            : getSolutionsControllerFindCurrentAnalysisV0ResponseMock(),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};

export const getSolutionsControllerLatestSolutionV0MockHandler = (
  overrideResponse?:
    | ExistingSolutionDto
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<ExistingSolutionDto> | ExistingSolutionDto),
) => {
  return http.get(
    "*/api/v0/classes/:classId/sessions/:sessionId/task/:taskId/solutions/latest",
    async (info) => {
      await delay(1000);

      return new HttpResponse(
        JSON.stringify(
          overrideResponse !== undefined
            ? typeof overrideResponse === "function"
              ? await overrideResponse(info)
              : overrideResponse
            : getSolutionsControllerLatestSolutionV0ResponseMock(),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};

export const getSolutionsControllerFindOneV0MockHandler = (
  overrideResponse?:
    | ExistingSolutionDto
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<ExistingSolutionDto> | ExistingSolutionDto),
) => {
  return http.get(
    "*/api/v0/classes/:classId/sessions/:sessionId/task/:taskId/solutions/:id",
    async (info) => {
      await delay(1000);

      return new HttpResponse(
        JSON.stringify(
          overrideResponse !== undefined
            ? typeof overrideResponse === "function"
              ? await overrideResponse(info)
              : overrideResponse
            : getSolutionsControllerFindOneV0ResponseMock(),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};

export const getSolutionsControllerDeleteOneV0MockHandler = (
  overrideResponse?:
    | void
    | ((
        info: Parameters<Parameters<typeof http.delete>[1]>[0],
      ) => Promise<void> | void),
) => {
  return http.delete(
    "*/api/v0/classes/:classId/sessions/:sessionId/task/:taskId/solutions/:id",
    async (info) => {
      await delay(1000);
      if (typeof overrideResponse === "function") {
        await overrideResponse(info);
      }
      return new HttpResponse(null, { status: 204 });
    },
  );
};

export const getSolutionsControllerDownloadOneV0MockHandler = (
  overrideResponse?:
    | void
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<void> | void),
) => {
  return http.get(
    "*/api/v0/classes/:classId/sessions/:sessionId/task/:taskId/solutions/:id/download",
    async (info) => {
      await delay(1000);
      if (typeof overrideResponse === "function") {
        await overrideResponse(info);
      }
      return new HttpResponse(null, { status: 200 });
    },
  );
};
export const getSolutionsMock = () => [
  getSolutionsControllerCreateV0MockHandler(),
  getSolutionsControllerFindAllV0MockHandler(),
  getSolutionsControllerFindCurrentAnalysisV0MockHandler(),
  getSolutionsControllerLatestSolutionV0MockHandler(),
  getSolutionsControllerFindOneV0MockHandler(),
  getSolutionsControllerDeleteOneV0MockHandler(),
  getSolutionsControllerDownloadOneV0MockHandler(),
];
