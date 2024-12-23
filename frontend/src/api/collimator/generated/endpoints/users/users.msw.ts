/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import { faker } from "@faker-js/faker";
import { HttpResponse, delay, http } from "msw";
import { AuthenticationProvider, UserType } from "../../models";
import type {
  DeletedUserDto,
  ExistingUserDto,
  RegistrationTokenDto,
} from "../../models";

export const getUsersControllerCreateV0ResponseMock = (
  overrideResponse: Partial<ExistingUserDto> = {},
): ExistingUserDto => ({
  authenticationProvider: faker.helpers.arrayElement([
    faker.helpers.arrayElement(Object.values(AuthenticationProvider)),
  ]),
  email: faker.word.sample(),
  id: faker.number.int({ min: undefined, max: undefined }),
  name: faker.helpers.arrayElement([faker.word.sample(), null]),
  oidcSub: faker.helpers.arrayElement([faker.word.sample(), null]),
  publicKeyId: {},
  type: faker.helpers.arrayElement([
    faker.helpers.arrayElement(Object.values(UserType)),
  ]),
  ...overrideResponse,
});

export const getUsersControllerFindAllV0ResponseMock = (): ExistingUserDto[] =>
  Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    (_, i) => i + 1,
  ).map(() => ({
    authenticationProvider: faker.helpers.arrayElement([
      faker.helpers.arrayElement(Object.values(AuthenticationProvider)),
    ]),
    email: faker.word.sample(),
    id: faker.number.int({ min: undefined, max: undefined }),
    name: faker.helpers.arrayElement([faker.word.sample(), null]),
    oidcSub: faker.helpers.arrayElement([faker.word.sample(), null]),
    publicKeyId: {},
    type: faker.helpers.arrayElement([
      faker.helpers.arrayElement(Object.values(UserType)),
    ]),
  }));

export const getUsersControllerFindOneV0ResponseMock = (
  overrideResponse: Partial<ExistingUserDto> = {},
): ExistingUserDto => ({
  authenticationProvider: faker.helpers.arrayElement([
    faker.helpers.arrayElement(Object.values(AuthenticationProvider)),
  ]),
  email: faker.word.sample(),
  id: faker.number.int({ min: undefined, max: undefined }),
  name: faker.helpers.arrayElement([faker.word.sample(), null]),
  oidcSub: faker.helpers.arrayElement([faker.word.sample(), null]),
  publicKeyId: {},
  type: faker.helpers.arrayElement([
    faker.helpers.arrayElement(Object.values(UserType)),
  ]),
  ...overrideResponse,
});

export const getUsersControllerUpdateV0ResponseMock = (
  overrideResponse: Partial<ExistingUserDto> = {},
): ExistingUserDto => ({
  authenticationProvider: faker.helpers.arrayElement([
    faker.helpers.arrayElement(Object.values(AuthenticationProvider)),
  ]),
  email: faker.word.sample(),
  id: faker.number.int({ min: undefined, max: undefined }),
  name: faker.helpers.arrayElement([faker.word.sample(), null]),
  oidcSub: faker.helpers.arrayElement([faker.word.sample(), null]),
  publicKeyId: {},
  type: faker.helpers.arrayElement([
    faker.helpers.arrayElement(Object.values(UserType)),
  ]),
  ...overrideResponse,
});

export const getUsersControllerDeleteV0ResponseMock = (
  overrideResponse: Partial<DeletedUserDto> = {},
): DeletedUserDto => ({
  authenticationProvider: faker.helpers.arrayElement([
    faker.helpers.arrayElement(Object.values(AuthenticationProvider)),
  ]),
  email: faker.word.sample(),
  id: faker.number.int({ min: undefined, max: undefined }),
  name: faker.helpers.arrayElement([faker.word.sample(), null]),
  oidcSub: faker.helpers.arrayElement([faker.word.sample(), null]),
  publicKeyId: {},
  type: faker.helpers.arrayElement([
    faker.helpers.arrayElement(Object.values(UserType)),
  ]),
  ...overrideResponse,
});

export const getUsersControllerUpdateKeyV0ResponseMock = (): number =>
  faker.number.int();

export const getUsersControllerCreateRegistrationTokenV0ResponseMock = (
  overrideResponse: Partial<RegistrationTokenDto> = {},
): RegistrationTokenDto => ({
  token: faker.word.sample(),
  ...overrideResponse,
});

export const getUsersControllerCreateV0MockHandler = (
  overrideResponse?:
    | ExistingUserDto
    | ((
        info: Parameters<Parameters<typeof http.post>[1]>[0],
      ) => Promise<ExistingUserDto> | ExistingUserDto),
) => {
  return http.post("*/api/v0/users", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getUsersControllerCreateV0ResponseMock(),
      ),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getUsersControllerFindAllV0MockHandler = (
  overrideResponse?:
    | ExistingUserDto[]
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<ExistingUserDto[]> | ExistingUserDto[]),
) => {
  return http.get("*/api/v0/users", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getUsersControllerFindAllV0ResponseMock(),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getUsersControllerFindOneV0MockHandler = (
  overrideResponse?:
    | ExistingUserDto
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<ExistingUserDto> | ExistingUserDto),
) => {
  return http.get("*/api/v0/users/:id", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getUsersControllerFindOneV0ResponseMock(),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getUsersControllerUpdateV0MockHandler = (
  overrideResponse?:
    | ExistingUserDto
    | ((
        info: Parameters<Parameters<typeof http.patch>[1]>[0],
      ) => Promise<ExistingUserDto> | ExistingUserDto),
) => {
  return http.patch("*/api/v0/users/:id", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getUsersControllerUpdateV0ResponseMock(),
      ),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getUsersControllerDeleteV0MockHandler = (
  overrideResponse?:
    | DeletedUserDto
    | ((
        info: Parameters<Parameters<typeof http.delete>[1]>[0],
      ) => Promise<DeletedUserDto> | DeletedUserDto),
) => {
  return http.delete("*/api/v0/users/:id", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getUsersControllerDeleteV0ResponseMock(),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getUsersControllerUpdateKeyV0MockHandler = (
  overrideResponse?:
    | number
    | ((
        info: Parameters<Parameters<typeof http.patch>[1]>[0],
      ) => Promise<number> | number),
) => {
  return http.patch("*/api/v0/users/:id/key", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getUsersControllerUpdateKeyV0ResponseMock(),
      ),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getUsersControllerCreateRegistrationTokenV0MockHandler = (
  overrideResponse?:
    | RegistrationTokenDto
    | ((
        info: Parameters<Parameters<typeof http.post>[1]>[0],
      ) => Promise<RegistrationTokenDto> | RegistrationTokenDto),
) => {
  return http.post("*/api/v0/users/:id/registration", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getUsersControllerCreateRegistrationTokenV0ResponseMock(),
      ),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  });
};
export const getUsersMock = () => [
  getUsersControllerCreateV0MockHandler(),
  getUsersControllerFindAllV0MockHandler(),
  getUsersControllerFindOneV0MockHandler(),
  getUsersControllerUpdateV0MockHandler(),
  getUsersControllerDeleteV0MockHandler(),
  getUsersControllerUpdateKeyV0MockHandler(),
  getUsersControllerCreateRegistrationTokenV0MockHandler(),
];
