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

type NonStudentTeacherAuthenticated = AuthenticationVersion1 & {
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
  authenticationToken: string;
  keyPair: StudentKeyPair;
};

export type AuthenticationContextType =
  | Unauthenticated
  | TeacherAuthenticated
  | NonStudentTeacherAuthenticated
  | StudentLocallyAuthenticated
  | StudentAuthenticated;

type SerializedAuthenticationContextTypeV1 =
  | Unauthenticated
  | SerializedKeyPair<TeacherAuthenticated>
  | NonStudentTeacherAuthenticated
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
  authentcationContext: AuthenticationContextType,
): Promise<SerializedAuthenticationContextType> => {
  if (!("keyPair" in authentcationContext)) {
    return authentcationContext;
  }

  const { keyPair, ...rest } = authentcationContext;

  const serializedKeyPair = await keyPair.exportUnprotected();

  return {
    ...rest,
    keyPair: serializedKeyPair,
  };
};

export const deserializeAuthenticationContext = async (
  serializedContext: SerializedAuthenticationContextType,
): Promise<AuthenticationContextType> => {
  if (!("keyPair" in serializedContext)) {
    return serializedContext;
  }

  const { keyPair, ...rest } = serializedContext;

  const importedCryptoKeyPair = await KeyPair.importUnprotected(
    window.crypto.subtle,
    keyPair,
  );

  if (rest.role === UserRole.teacher) {
    const importedKeyPair = new TeacherLongTermKeyPair(
      window.crypto.subtle,
      importedCryptoKeyPair,
    );

    return {
      ...rest,
      keyPair: importedKeyPair,
    };
  } else {
    const importedKeyPair = new StudentKeyPair(
      window.crypto.subtle,
      importedCryptoKeyPair,
    );

    return {
      ...rest,
      keyPair: importedKeyPair,
    };
  }
};
