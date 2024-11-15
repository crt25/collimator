import { UserRole } from "@/types/user/user-role";
import EphemeralKey from "@/utilities/crypto/EphemeralKey";
import KeyPair from "@/utilities/crypto/KeyPair";
import StudentKeyPair from "@/utilities/crypto/StudentKeyPair";
import TeacherLongTermKeyPair from "@/utilities/crypto/TeacherLongTermKeyPair";
import { createContext } from "react";

type SerializedKeyPair<
  T extends {
    keyPair: KeyPair;
  },
> = Omit<T, "keyPair"> & {
  keyPair: {
    privateKey: JsonWebKey;
    publicKey: JsonWebKey;
  };
};

type AuthenticationContextVersion = "1";

type AuthenticationVersion1 = {
  version: "1";
};

type Unauthenticated = AuthenticationVersion1 & {
  idToken: undefined;
  authenticationToken: undefined;
  role: undefined;
};

export type AdminOrTeacherAuthenticated = AuthenticationVersion1 & {
  idToken: string;
  authenticationToken: string;
  userId: number;
  name: string;
  email: string;
  role: UserRole.teacher | UserRole.admin;
  keyPair: TeacherLongTermKeyPair;
  keyPairId: number;
};

export type StudentLocallyAuthenticated = AuthenticationVersion1 & {
  idToken: string;
  authenticationToken: undefined;
  name: string;
  email: string;
  role: UserRole.student;
};

export type StudentAuthenticated = Omit<
  StudentLocallyAuthenticated,
  "authenticationToken"
> & {
  // a student is always authenticated with respect to a session
  sessionId: number;
  authenticationToken: string;
  keyPair: StudentKeyPair;
  ephemeralKey: EphemeralKey;
};

export type AuthenticationContextType =
  | Unauthenticated
  | AdminOrTeacherAuthenticated
  | StudentLocallyAuthenticated
  | StudentAuthenticated;

type SerializedAuthenticationContextTypeV1 =
  | Unauthenticated
  | SerializedKeyPair<AdminOrTeacherAuthenticated>
  | StudentLocallyAuthenticated
  | SerializedKeyPair<StudentAuthenticated>;

export type SerializedAuthenticationContextType =
  SerializedAuthenticationContextTypeV1;

export const latestAuthenticationContextVersion: AuthenticationContextVersion =
  "1";

export const isStudentLocallyAuthenticated = (
  authContext: AuthenticationContextType,
): authContext is StudentLocallyAuthenticated =>
  authContext.version === latestAuthenticationContextVersion &&
  authContext.role === UserRole.student &&
  authContext.idToken !== undefined &&
  authContext.authenticationToken === undefined;

export const isStudentFullyAuthenticated = (
  authContext: AuthenticationContextType,
  sessionId: number,
): authContext is StudentAuthenticated =>
  authContext.version === latestAuthenticationContextVersion &&
  authContext.role === UserRole.student &&
  authContext.idToken !== undefined &&
  authContext.authenticationToken !== undefined &&
  authContext.sessionId === sessionId;

export const isStudentAuthenticated = (
  authContext: AuthenticationContextType,
): authContext is StudentLocallyAuthenticated | StudentAuthenticated =>
  authContext.version === latestAuthenticationContextVersion &&
  authContext.role === UserRole.student &&
  authContext.idToken !== undefined;

export const isFullyAuthenticated = (
  authContext: AuthenticationContextType,
): authContext is AdminOrTeacherAuthenticated | StudentAuthenticated =>
  authContext.version === latestAuthenticationContextVersion &&
  authContext.idToken !== undefined &&
  authContext.authenticationToken !== undefined;

export const authenticationContextDefaultValue: AuthenticationContextType = {
  version: latestAuthenticationContextVersion,
  idToken: undefined,
  authenticationToken: undefined,
  role: undefined,
};

export const AuthenticationContext = createContext<AuthenticationContextType>(
  authenticationContextDefaultValue,
);

export const serializeAuthenticationContext = async (
  authContext: AuthenticationContextType,
): Promise<SerializedAuthenticationContextType> => {
  if (!("keyPair" in authContext)) {
    return authContext;
  }

  const { keyPair, ...rest } = authContext;

  const serializedKeyPair = await keyPair.exportUnprotected();

  return {
    ...rest,
    keyPair: serializedKeyPair,
  };
};

export const deserializeAuthenticationContext = async (
  crypto: SubtleCrypto,
  serializedContext: SerializedAuthenticationContextType,
): Promise<AuthenticationContextType> => {
  if (!("keyPair" in serializedContext)) {
    return serializedContext;
  }

  const { keyPair, ...rest } = serializedContext;

  const importedCryptoKeyPair = await KeyPair.importUnprotected(
    crypto,
    keyPair,
  );

  if (rest.role === UserRole.student) {
    return {
      ...rest,
      keyPair: await StudentKeyPair.create(crypto, importedCryptoKeyPair),
    };
  }

  return {
    ...rest,
    keyPair: await TeacherLongTermKeyPair.create(crypto, importedCryptoKeyPair),
  };
};
