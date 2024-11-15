/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Collimator
 * The Collimator API description (multi-version)
 * OpenAPI spec version: 1.0.0
 */
import type {
  AuthenticationRequestDto,
  AuthenticationResponseDto,
  AuthenticationTokenDto,
  PublicKeyDto,
  StudentAuthenticationRequestDto,
  StudentAuthenticationResponseDto,
} from "../../models";
import { fetchApi } from "../../../../fetch";

export const getAuthenticationControllerFindPublicKeyV0Url = (
  fingerprint: string,
) => {
  return `/api/v0/authentication/public-key/${fingerprint}`;
};

export const authenticationControllerFindPublicKeyV0 = async (
  fingerprint: string,
  options?: RequestInit,
): Promise<PublicKeyDto> => {
  return fetchApi<Promise<PublicKeyDto>>(
    getAuthenticationControllerFindPublicKeyV0Url(fingerprint),
    {
      ...options,
      method: "GET",
    },
  );
};

export const getAuthenticationControllerLoginV0Url = () => {
  return `/api/v0/authentication/login`;
};

export const authenticationControllerLoginV0 = async (
  authenticationRequestDto: AuthenticationRequestDto,
  options?: RequestInit,
): Promise<AuthenticationResponseDto> => {
  return fetchApi<Promise<AuthenticationResponseDto>>(
    getAuthenticationControllerLoginV0Url(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(authenticationRequestDto),
    },
  );
};

export const getAuthenticationControllerLoginStudentV0Url = () => {
  return `/api/v0/authentication/login/student`;
};

export const authenticationControllerLoginStudentV0 = async (
  studentAuthenticationRequestDto: StudentAuthenticationRequestDto,
  options?: RequestInit,
): Promise<StudentAuthenticationResponseDto> => {
  return fetchApi<Promise<StudentAuthenticationResponseDto>>(
    getAuthenticationControllerLoginStudentV0Url(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(studentAuthenticationRequestDto),
    },
  );
};

export const getAuthenticationControllerWebsocketTokenV0Url = () => {
  return `/api/v0/authentication/websocket-token`;
};

export const authenticationControllerWebsocketTokenV0 = async (
  options?: RequestInit,
): Promise<AuthenticationTokenDto> => {
  return fetchApi<Promise<AuthenticationTokenDto>>(
    getAuthenticationControllerWebsocketTokenV0Url(),
    {
      ...options,
      method: "POST",
    },
  );
};
