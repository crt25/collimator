/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description
 * OpenAPI spec version: 0.1
 */
import { faker } from "@faker-js/faker";
import { HttpResponse, delay, http } from "msw";
import type {
  DeletedClassDto,
  ExistingClassDto,
  ExistingClassExtendedDto,
  ExistingClassWithTeacherDto,
} from "../../models";

export const getClassesControllerCreateResponseMock = (
  overrideResponse: Partial<ExistingClassDto> = {},
): ExistingClassDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  name: faker.word.sample(),
  teacherId: faker.number.int({ min: undefined, max: undefined }),
  ...overrideResponse,
});

export const getClassesControllerFindAllResponseMock =
  (): ExistingClassWithTeacherDto[] =>
    Array.from(
      { length: faker.number.int({ min: 1, max: 10 }) },
      (_, i) => i + 1,
    ).map(() => ({
      id: faker.number.int({ min: undefined, max: undefined }),
      name: faker.word.sample(),
      teacher: {},
      teacherId: faker.number.int({ min: undefined, max: undefined }),
    }));

export const getClassesControllerFindOneResponseMock = (
  overrideResponse: Partial<ExistingClassExtendedDto> = {},
): ExistingClassExtendedDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  name: faker.word.sample(),
  sessions: Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => faker.number.int({ min: undefined, max: undefined })),
  studentCount: faker.number.int({ min: undefined, max: undefined }),
  teacher: {},
  teacherId: faker.number.int({ min: undefined, max: undefined }),
  ...overrideResponse,
});

export const getClassesControllerUpdateResponseMock = (
  overrideResponse: Partial<ExistingClassDto> = {},
): ExistingClassDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  name: faker.word.sample(),
  teacherId: faker.number.int({ min: undefined, max: undefined }),
  ...overrideResponse,
});

export const getClassesControllerRemoveResponseMock = (
  overrideResponse: Partial<DeletedClassDto> = {},
): DeletedClassDto => ({
  id: faker.number.int({ min: undefined, max: undefined }),
  name: faker.word.sample(),
  teacherId: faker.number.int({ min: undefined, max: undefined }),
  ...overrideResponse,
});

export const getClassesControllerCreateMockHandler = (
  overrideResponse?:
    | ExistingClassDto
    | ((
        info: Parameters<Parameters<typeof http.post>[1]>[0],
      ) => Promise<ExistingClassDto> | ExistingClassDto),
) => {
  return http.post("*/classes", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getClassesControllerCreateResponseMock(),
      ),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getClassesControllerFindAllMockHandler = (
  overrideResponse?:
    | ExistingClassWithTeacherDto[]
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) =>
        | Promise<ExistingClassWithTeacherDto[]>
        | ExistingClassWithTeacherDto[]),
) => {
  return http.get("*/classes", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getClassesControllerFindAllResponseMock(),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getClassesControllerFindOneMockHandler = (
  overrideResponse?:
    | ExistingClassExtendedDto
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<ExistingClassExtendedDto> | ExistingClassExtendedDto),
) => {
  return http.get("*/classes/:id", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getClassesControllerFindOneResponseMock(),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getClassesControllerUpdateMockHandler = (
  overrideResponse?:
    | ExistingClassDto
    | ((
        info: Parameters<Parameters<typeof http.patch>[1]>[0],
      ) => Promise<ExistingClassDto> | ExistingClassDto),
) => {
  return http.patch("*/classes/:id", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getClassesControllerUpdateResponseMock(),
      ),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getClassesControllerRemoveMockHandler = (
  overrideResponse?:
    | DeletedClassDto
    | ((
        info: Parameters<Parameters<typeof http.delete>[1]>[0],
      ) => Promise<DeletedClassDto> | DeletedClassDto),
) => {
  return http.delete("*/classes/:id", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getClassesControllerRemoveResponseMock(),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
};
export const getClassesMock = () => [
  getClassesControllerCreateMockHandler(),
  getClassesControllerFindAllMockHandler(),
  getClassesControllerFindOneMockHandler(),
  getClassesControllerUpdateMockHandler(),
  getClassesControllerRemoveMockHandler(),
];