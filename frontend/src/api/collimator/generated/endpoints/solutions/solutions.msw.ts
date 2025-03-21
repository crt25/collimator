/**
 * Generated by orval v7.6.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import { faker } from "@faker-js/faker";

import { HttpResponse, delay, http } from "msw";

import type {
  CurrentAnalysesDto,
  ExistingStudentSolutionDto,
} from "../../models";

export const getSolutionsControllerCreateStudentSolutionV0ResponseMock = (
  overrideResponse: Partial<ExistingStudentSolutionDto> = {},
): ExistingStudentSolutionDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
  isReference: faker.datatype.boolean(),
  studentId: faker.number.int({ min: undefined, max: undefined }),
  sessionId: faker.number.int({ min: undefined, max: undefined }),
  taskId: faker.number.int({ min: undefined, max: undefined }),
  solutionHash: faker.string.alpha(20),
  solution: {
    ...{
      hash: faker.string.alpha(20),
      taskId: faker.number.int({ min: undefined, max: undefined }),
    },
  },
  tests: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => ({
    identifier: faker.helpers.arrayElement([faker.string.alpha(20), null]),
    name: faker.string.alpha(20),
    contextName: faker.helpers.arrayElement([faker.string.alpha(20), null]),
    passed: faker.datatype.boolean(),
    id: faker.number.int({ min: undefined, max: undefined }),
    referenceSolutionId: {},
    studentSolutionId: {},
  })),
  ...overrideResponse,
});

export const getSolutionsControllerFindAllStudentSolutionsV0ResponseMock =
  (): ExistingStudentSolutionDto[] =>
    Array.from(
      { length: faker.number.int({ min: 1, max: 10 }) },
      (_, i) => i + 1,
    ).map(() => ({
      id: faker.number.int({ min: undefined, max: undefined }),
      createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
      isReference: faker.datatype.boolean(),
      studentId: faker.number.int({ min: undefined, max: undefined }),
      sessionId: faker.number.int({ min: undefined, max: undefined }),
      taskId: faker.number.int({ min: undefined, max: undefined }),
      solutionHash: faker.string.alpha(20),
      solution: {
        ...{
          hash: faker.string.alpha(20),
          taskId: faker.number.int({ min: undefined, max: undefined }),
        },
      },
      tests: Array.from(
        { length: faker.number.int({ min: 1, max: 10 }) },
        (_, i) => i + 1,
      ).map(() => ({
        identifier: faker.helpers.arrayElement([faker.string.alpha(20), null]),
        name: faker.string.alpha(20),
        contextName: faker.helpers.arrayElement([faker.string.alpha(20), null]),
        passed: faker.datatype.boolean(),
        id: faker.number.int({ min: undefined, max: undefined }),
        referenceSolutionId: {},
        studentSolutionId: {},
      })),
    }));

export const getSolutionsControllerFindCurrentAnalysesV0ResponseMock = (
  overrideResponse: Partial<CurrentAnalysesDto> = {},
): CurrentAnalysesDto => ({
  studentAnalyses: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => ({
    taskId: faker.number.int({ min: undefined, max: undefined }),
    solutionHash: faker.string.alpha(20),
    isReferenceSolution: faker.datatype.boolean(),
    tests: Array.from(
      { length: faker.number.int({ min: 1, max: 10 }) },
      (_, i) => i + 1,
    ).map(() => ({
      identifier: faker.helpers.arrayElement([faker.string.alpha(20), null]),
      name: faker.string.alpha(20),
      contextName: faker.helpers.arrayElement([faker.string.alpha(20), null]),
      passed: faker.datatype.boolean(),
      id: faker.number.int({ min: undefined, max: undefined }),
      referenceSolutionId: {},
      studentSolutionId: {},
    })),
    studentKeyPairId: faker.helpers.arrayElement([
      faker.number.int({ min: undefined, max: undefined }),
      null,
    ]),
    astVersion: faker.string.alpha(20),
    genericAst: faker.string.alpha(20),
    studentId: faker.number.int({ min: undefined, max: undefined }),
    studentSolutionId: faker.number.int({ min: undefined, max: undefined }),
    studentPseudonym: faker.string.alpha(20),
    sessionId: faker.number.int({ min: undefined, max: undefined }),
  })),
  referenceAnalyses: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => ({
    taskId: faker.number.int({ min: undefined, max: undefined }),
    solutionHash: faker.string.alpha(20),
    isReferenceSolution: faker.datatype.boolean(),
    tests: Array.from(
      { length: faker.number.int({ min: 1, max: 10 }) },
      (_, i) => i + 1,
    ).map(() => ({
      identifier: faker.helpers.arrayElement([faker.string.alpha(20), null]),
      name: faker.string.alpha(20),
      contextName: faker.helpers.arrayElement([faker.string.alpha(20), null]),
      passed: faker.datatype.boolean(),
      id: faker.number.int({ min: undefined, max: undefined }),
      referenceSolutionId: {},
      studentSolutionId: {},
    })),
    studentKeyPairId: faker.helpers.arrayElement([
      faker.number.int({ min: undefined, max: undefined }),
      null,
    ]),
    astVersion: faker.string.alpha(20),
    genericAst: faker.string.alpha(20),
    title: faker.string.alpha(20),
    description: faker.string.alpha(20),
    referenceSolutionId: faker.number.int({ min: undefined, max: undefined }),
  })),
  ...overrideResponse,
});

export const getSolutionsControllerDownloadLatestStudentSolutionV0ResponseMock =
  (
    overrideResponse: Partial<ExistingStudentSolutionDto> = {},
  ): ExistingStudentSolutionDto => ({
    id: faker.number.int({ min: undefined, max: undefined }),
    createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
    isReference: faker.datatype.boolean(),
    studentId: faker.number.int({ min: undefined, max: undefined }),
    sessionId: faker.number.int({ min: undefined, max: undefined }),
    taskId: faker.number.int({ min: undefined, max: undefined }),
    solutionHash: faker.string.alpha(20),
    solution: {
      ...{
        hash: faker.string.alpha(20),
        taskId: faker.number.int({ min: undefined, max: undefined }),
      },
    },
    tests: Array.from(
      { length: faker.number.int({ min: 1, max: 10 }) },
      (_, i) => i + 1,
    ).map(() => ({
      identifier: faker.helpers.arrayElement([faker.string.alpha(20), null]),
      name: faker.string.alpha(20),
      contextName: faker.helpers.arrayElement([faker.string.alpha(20), null]),
      passed: faker.datatype.boolean(),
      id: faker.number.int({ min: undefined, max: undefined }),
      referenceSolutionId: {},
      studentSolutionId: {},
    })),
    ...overrideResponse,
  });

export const getSolutionsControllerFindOneStudentSolutionV0ResponseMock = (
  overrideResponse: Partial<ExistingStudentSolutionDto> = {},
): ExistingStudentSolutionDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
  isReference: faker.datatype.boolean(),
  studentId: faker.number.int({ min: undefined, max: undefined }),
  sessionId: faker.number.int({ min: undefined, max: undefined }),
  taskId: faker.number.int({ min: undefined, max: undefined }),
  solutionHash: faker.string.alpha(20),
  solution: {
    ...{
      hash: faker.string.alpha(20),
      taskId: faker.number.int({ min: undefined, max: undefined }),
    },
  },
  tests: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => ({
    identifier: faker.helpers.arrayElement([faker.string.alpha(20), null]),
    name: faker.string.alpha(20),
    contextName: faker.helpers.arrayElement([faker.string.alpha(20), null]),
    passed: faker.datatype.boolean(),
    id: faker.number.int({ min: undefined, max: undefined }),
    referenceSolutionId: {},
    studentSolutionId: {},
  })),
  ...overrideResponse,
});

export const getSolutionsControllerCreateStudentSolutionV0MockHandler = (
  overrideResponse?:
    | ExistingStudentSolutionDto
    | ((
        info: Parameters<Parameters<typeof http.post>[1]>[0],
      ) => Promise<ExistingStudentSolutionDto> | ExistingStudentSolutionDto),
) => {
  return http.post(
    "*/api/v0/classes/:classId/sessions/:sessionId/task/:taskId/solutions/student",
    async (info) => {
      await delay(1000);

      return new HttpResponse(
        JSON.stringify(
          overrideResponse !== undefined
            ? typeof overrideResponse === "function"
              ? await overrideResponse(info)
              : overrideResponse
            : getSolutionsControllerCreateStudentSolutionV0ResponseMock(),
        ),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};

export const getSolutionsControllerFindAllStudentSolutionsV0MockHandler = (
  overrideResponse?:
    | ExistingStudentSolutionDto[]
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) =>
        | Promise<ExistingStudentSolutionDto[]>
        | ExistingStudentSolutionDto[]),
) => {
  return http.get(
    "*/api/v0/classes/:classId/sessions/:sessionId/task/:taskId/solutions/student",
    async (info) => {
      await delay(1000);

      return new HttpResponse(
        JSON.stringify(
          overrideResponse !== undefined
            ? typeof overrideResponse === "function"
              ? await overrideResponse(info)
              : overrideResponse
            : getSolutionsControllerFindAllStudentSolutionsV0ResponseMock(),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};

export const getSolutionsControllerFindCurrentAnalysesV0MockHandler = (
  overrideResponse?:
    | CurrentAnalysesDto
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<CurrentAnalysesDto> | CurrentAnalysesDto),
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
            : getSolutionsControllerFindCurrentAnalysesV0ResponseMock(),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};

export const getSolutionsControllerDownloadLatestStudentSolutionV0MockHandler =
  (
    overrideResponse?:
      | ExistingStudentSolutionDto
      | ((
          info: Parameters<Parameters<typeof http.get>[1]>[0],
        ) => Promise<ExistingStudentSolutionDto> | ExistingStudentSolutionDto),
  ) => {
    return http.get(
      "*/api/v0/classes/:classId/sessions/:sessionId/task/:taskId/solutions/student/latest",
      async (info) => {
        await delay(1000);

        return new HttpResponse(
          JSON.stringify(
            overrideResponse !== undefined
              ? typeof overrideResponse === "function"
                ? await overrideResponse(info)
                : overrideResponse
              : getSolutionsControllerDownloadLatestStudentSolutionV0ResponseMock(),
          ),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    );
  };

export const getSolutionsControllerFindOneStudentSolutionV0MockHandler = (
  overrideResponse?:
    | ExistingStudentSolutionDto
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<ExistingStudentSolutionDto> | ExistingStudentSolutionDto),
) => {
  return http.get(
    "*/api/v0/classes/:classId/sessions/:sessionId/task/:taskId/solutions/student/:id",
    async (info) => {
      await delay(1000);

      return new HttpResponse(
        JSON.stringify(
          overrideResponse !== undefined
            ? typeof overrideResponse === "function"
              ? await overrideResponse(info)
              : overrideResponse
            : getSolutionsControllerFindOneStudentSolutionV0ResponseMock(),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};

export const getSolutionsControllerDeleteOneStudentSolutionV0MockHandler = (
  overrideResponse?:
    | void
    | ((
        info: Parameters<Parameters<typeof http.delete>[1]>[0],
      ) => Promise<void> | void),
) => {
  return http.delete(
    "*/api/v0/classes/:classId/sessions/:sessionId/task/:taskId/solutions/student/:id",
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
    "*/api/v0/classes/:classId/sessions/:sessionId/task/:taskId/solutions/:hash/download",
    async (info) => {
      await delay(1000);
      if (typeof overrideResponse === "function") {
        await overrideResponse(info);
      }
      return new HttpResponse(null, { status: 200 });
    },
  );
};

export const getSolutionsControllerPatchStudentSolutionIsReferenceV0MockHandler =
  (
    overrideResponse?:
      | void
      | ((
          info: Parameters<Parameters<typeof http.patch>[1]>[0],
        ) => Promise<void> | void),
  ) => {
    return http.patch(
      "*/api/v0/classes/:classId/sessions/:sessionId/task/:taskId/solutions/student/:id/isReference",
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
  getSolutionsControllerCreateStudentSolutionV0MockHandler(),
  getSolutionsControllerFindAllStudentSolutionsV0MockHandler(),
  getSolutionsControllerFindCurrentAnalysesV0MockHandler(),
  getSolutionsControllerDownloadLatestStudentSolutionV0MockHandler(),
  getSolutionsControllerFindOneStudentSolutionV0MockHandler(),
  getSolutionsControllerDeleteOneStudentSolutionV0MockHandler(),
  getSolutionsControllerDownloadOneV0MockHandler(),
  getSolutionsControllerPatchStudentSolutionIsReferenceV0MockHandler(),
];
