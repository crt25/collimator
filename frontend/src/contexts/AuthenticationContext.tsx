import { createContext } from "react";
import { UserRole } from "@/types/user/user-role";
import EphemeralKey from "@/utilities/crypto/EphemeralKey";
import KeyPair from "@/utilities/crypto/KeyPair";
import StudentKeyPair from "@/utilities/crypto/StudentKeyPair";
import TeacherLongTermKeyPair from "@/utilities/crypto/TeacherLongTermKeyPair";

type SerializedTeacherKeyPair<
  T extends {
    keyPair: KeyPair;
  },
> = Omit<T, "keyPair"> & {
  keyPair: {
    privateKey: JsonWebKey;
    publicKey: JsonWebKey;
  };
  saltPublicKey: JsonWebKey;
};

type SerializedStudentKeyPair<
  T extends {
    keyPair: KeyPair;
  },
> = Omit<T, "keyPair" | "teacherPublicKey" | "ephemeralKey"> & {
  keyPair: {
    privateKey: JsonWebKey;
    publicKey: JsonWebKey;
  };
  saltPublicKey: JsonWebKey;
  // the ephemeral key is not serialized
  ephemeralKey: undefined;
  // but the teacher public key is which allows deriving it again
  teacherPublicKey: JsonWebKey;
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
  isAnonymous: false;
  idToken: string;
  authenticationToken: undefined;
  name: string;
  role: UserRole.student;
};

export type StudentAuthenticated = Omit<
  StudentLocallyAuthenticated,
  "authenticationToken"
> & {
  // a student is always authenticated with respect to a session
  sessionId: number;
  teacherPublicKey: JsonWebKey;
  authenticationToken: string;
  keyPair: StudentKeyPair;
  ephemeralKey: EphemeralKey;
};

export type StudentAuthenticatedAnonymous = Omit<
  StudentAuthenticated,
  "idToken" | "ephemeralKey" | "isAnonymous" | "name"
> & {
  isAnonymous: true;
  name: undefined;
  idToken: undefined;
  ephemeralKey: undefined;
};

export type AuthenticationContextType =
  | Unauthenticated
  | AdminOrTeacherAuthenticated
  | StudentLocallyAuthenticated
  | StudentAuthenticated
  | StudentAuthenticatedAnonymous;

type SerializedAuthenticationContextTypeV1 =
  | Unauthenticated
  | SerializedTeacherKeyPair<AdminOrTeacherAuthenticated>
  | StudentLocallyAuthenticated
  | SerializedStudentKeyPair<StudentAuthenticated>
  | SerializedStudentKeyPair<StudentAuthenticatedAnonymous>;

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
): authContext is StudentAuthenticated | StudentAuthenticatedAnonymous =>
  authContext.version === latestAuthenticationContextVersion &&
  authContext.role === UserRole.student &&
  authContext.authenticationToken !== undefined &&
  authContext.sessionId === sessionId;

export const isStudentAuthenticated = (
  authContext: AuthenticationContextType,
): authContext is
  | StudentLocallyAuthenticated
  | StudentAuthenticated
  | StudentAuthenticatedAnonymous =>
  authContext.version === latestAuthenticationContextVersion &&
  authContext.role === UserRole.student &&
  // if the authentication token is set, the student is fully authenticated
  // if not, but the id token is set, the student is locally authenticated
  (authContext.authenticationToken !== undefined ||
    authContext.idToken !== undefined);

export const isFullyAuthenticated = (
  authContext: AuthenticationContextType,
): authContext is
  | AdminOrTeacherAuthenticated
  | StudentAuthenticated
  | StudentAuthenticatedAnonymous =>
  authContext.version === latestAuthenticationContextVersion &&
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

  if (rest.role === UserRole.student) {
    return {
      ...rest,
      ephemeralKey: undefined,
      keyPair: await keyPair.exportUnprotected(),
      saltPublicKey: await keyPair.exportSaltPublicKey(),
      teacherPublicKey: rest.teacherPublicKey,
    };
  } else {
    return {
      ...rest,
      keyPair: await keyPair.exportUnprotected(),
      saltPublicKey: await keyPair.exportSaltPublicKey(),
    };
  }
};

export const deserializeAuthenticationContext = async (
  crypto: SubtleCrypto,
  serializedContext: SerializedAuthenticationContextType,
): Promise<AuthenticationContextType> => {
  if (!("keyPair" in serializedContext)) {
    return serializedContext;
  }

  const { keyPair, saltPublicKey, ...rest } = serializedContext;

  const importedCryptoKeyPair = await KeyPair.importUnprotected(
    crypto,
    keyPair,
  );

  const importedSaltPublicKey = await crypto.importKey(
    "jwk",
    saltPublicKey,
    KeyPair.ImportAlgorithm,
    true,
    [],
  );

  const importedKeyPair = await StudentKeyPair.create(
    crypto,
    importedCryptoKeyPair,
    importedSaltPublicKey,
  );

  if (rest.role === UserRole.student) {
    if (rest.isAnonymous) {
      return {
        ...rest,
        teacherPublicKey: rest.teacherPublicKey,
        keyPair: importedKeyPair,
      } satisfies StudentAuthenticatedAnonymous;
    }

    return {
      ...rest,
      ephemeralKey: await importedKeyPair.deriveSharedEphemeralKey(
        rest.teacherPublicKey,
        // we already authenticated the teacher's public key
        await KeyPair.getJsonWebKeyKeyFingerprint(
          crypto,
          rest.teacherPublicKey,
        ),
      ),
      teacherPublicKey: rest.teacherPublicKey,
      keyPair: importedKeyPair,
    } satisfies StudentAuthenticated;
  }

  return {
    ...rest,
    keyPair: await TeacherLongTermKeyPair.create(
      crypto,
      importedCryptoKeyPair,
      importedSaltPublicKey,
    ),
  };
};
