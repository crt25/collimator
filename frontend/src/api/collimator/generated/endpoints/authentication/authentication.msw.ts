/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import { faker } from "@faker-js/faker";
import { HttpResponse, delay, http } from "msw";
import { UserType } from "../../models";
import type {
  AuthenticationResponseDto,
  PublicKeyDto,
  StudentAuthenticationResponseDto,
} from "../../models";

export const getAuthenticationControllerFindPublicKeyV0ResponseMock = (
  overrideResponse: Partial<PublicKeyDto> = {},
): PublicKeyDto => ({
  createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
  id: faker.number.int({ min: undefined, max: undefined }),
  publicKey: faker.word.sample(),
  teacherId: faker.number.int({ min: undefined, max: undefined }),
  ...overrideResponse,
});

export const getAuthenticationControllerLoginV0ResponseMock = (
  overrideResponse: Partial<AuthenticationResponseDto> = {},
): AuthenticationResponseDto => ({
  authenticationToken: faker.word.sample(),
  email: faker.word.sample(),
  id: faker.number.int({ min: undefined, max: undefined }),
  keyPair: {
    createdAt: `${faker.date.past().toISOString().split(".")[0]}Z`,
    id: faker.number.int({ min: undefined, max: undefined }),
    privateKeys: Array.from(
      { length: faker.number.int({ min: 1, max: 10 }) },
      (_, i) => i + 1,
    ).map(() => ({
      encryptedPrivateKey: faker.word.sample(),
      salt: faker.word.sample(),
    })),
    publicKey: faker.word.sample(),
    publicKeyFingerprint: faker.word.sample(),
    salt: faker.word.sample(),
    teacherId: faker.number.int({ min: undefined, max: undefined }),
  },
  name: faker.helpers.arrayElement([faker.word.sample(), null]),
  type: faker.helpers.arrayElement([
    faker.helpers.arrayElement(Object.values(UserType)),
  ]),
  ...overrideResponse,
});

export const getAuthenticationControllerLoginStudentV0ResponseMock = (
  overrideResponse: Partial<StudentAuthenticationResponseDto> = {},
): StudentAuthenticationResponseDto => ({
  authenticationToken: faker.word.sample(),
  ...overrideResponse,
});

export const getAuthenticationControllerFindPublicKeyV0MockHandler = (
  overrideResponse?:
    | PublicKeyDto
    | ((
        info: Parameters<Parameters<typeof http.get>[1]>[0],
      ) => Promise<PublicKeyDto> | PublicKeyDto),
) => {
  return http.get(
    "*/api/v0/authentication/public-key/:fingerprint",
    async (info) => {
      await delay(1000);

      return new HttpResponse(
        JSON.stringify(
          overrideResponse !== undefined
            ? typeof overrideResponse === "function"
              ? await overrideResponse(info)
              : overrideResponse
            : getAuthenticationControllerFindPublicKeyV0ResponseMock(),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );
};

export const getAuthenticationControllerLoginV0MockHandler = (
  overrideResponse?:
    | AuthenticationResponseDto
    | ((
        info: Parameters<Parameters<typeof http.post>[1]>[0],
      ) => Promise<AuthenticationResponseDto> | AuthenticationResponseDto),
) => {
  return http.post("*/api/v0/authentication/login", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getAuthenticationControllerLoginV0ResponseMock(),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
};

export const getAuthenticationControllerLoginStudentV0MockHandler = (
  overrideResponse?:
    | StudentAuthenticationResponseDto
    | ((
        info: Parameters<Parameters<typeof http.post>[1]>[0],
      ) =>
        | Promise<StudentAuthenticationResponseDto>
        | StudentAuthenticationResponseDto),
) => {
  return http.post("*/api/v0/authentication/login/student", async (info) => {
    await delay(1000);

    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === "function"
            ? await overrideResponse(info)
            : overrideResponse
          : getAuthenticationControllerLoginStudentV0ResponseMock(),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  });
};
export const getAuthenticationMock = () => [
  getAuthenticationControllerFindPublicKeyV0MockHandler(),
  getAuthenticationControllerLoginV0MockHandler(),
  getAuthenticationControllerLoginStudentV0MockHandler(),
];
