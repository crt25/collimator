import { UserRole } from "@/i18n/user-role-messages";
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

type TeacherAuthenticated = AuthenticationVersion1 & {
  idToken: string;
  authenticationToken: string;
  name: string;
  email: string;
  role: UserRole.teacher;
  keyPair: TeacherLongTermKeyPair;
};

type AdminAuthenticated = AuthenticationVersion1 & {
  idToken: string;
  authenticationToken: string;
  name: string;
  email: string;
  role: Exclude<UserRole, UserRole.student | UserRole.teacher>;
};

type StudentLocallyAuthenticated = AuthenticationVersion1 & {
  idToken: string;
  authenticationToken: undefined;
  name: string;
  email: string;
  role: UserRole.student;
};

type StudentAuthenticated = Omit<
  StudentLocallyAuthenticated,
  "authenticationToken"
> & {
  // a student is always authenticated with respect to a session
  sessionId: number;
  authenticationToken: string;
  keyPair: StudentKeyPair;
};

export type AuthenticationContextType =
  | Unauthenticated
  | TeacherAuthenticated
  | AdminAuthenticated
  | StudentLocallyAuthenticated
  | StudentAuthenticated;

type SerializedAuthenticationContextTypeV1 =
  | Unauthenticated
  | SerializedKeyPair<TeacherAuthenticated>
  | AdminAuthenticated
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

  return rest.role === UserRole.teacher
    ? {
        ...rest,
        keyPair: new TeacherLongTermKeyPair(crypto, importedCryptoKeyPair),
      }
    : {
        ...rest,
        keyPair: new StudentKeyPair(crypto, importedCryptoKeyPair),
      };
};
