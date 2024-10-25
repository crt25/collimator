import StudentKeyPair from "@/utilities/crypto/StudentKeyPair";
import {
  authenticationContextDefaultValue,
  AuthenticationContextType,
  latestAuthenticationContextVersion,
} from "../AuthenticationContext";
import TeacherLongTermKeyPair from "@/utilities/crypto/TeacherLongTermKeyPair";
import { UserRole } from "@/i18n/user-role-messages";

const name = "John";
const email = "john@doe.com";
const authenticationToken = "authenticationToken";
const idToken = "id token";

type NonStudentTeacherRole = Exclude<
  UserRole,
  UserRole.teacher | UserRole.student
>;

export const getUnauthenticatedContext =
  async (): Promise<AuthenticationContextType> =>
    authenticationContextDefaultValue;

export const getLocallyAuthenticatedStudentContext =
  async (): Promise<AuthenticationContextType> => ({
    version: latestAuthenticationContextVersion,
    role: UserRole.student,
    idToken,
    authenticationToken: undefined,
    name,
    email,
  });

export const getFullyAuthenticatedStudentContext = async (
  crypto: SubtleCrypto,
): Promise<AuthenticationContextType> => ({
  version: latestAuthenticationContextVersion,
  role: UserRole.student,
  idToken,
  authenticationToken,
  name,
  email,
  keyPair: await StudentKeyPair.generate(crypto),
});

export const getAuthenticatedTeacherContext = async (
  crypto: SubtleCrypto,
): Promise<AuthenticationContextType> => ({
  version: latestAuthenticationContextVersion,
  role: UserRole.teacher,
  idToken,
  authenticationToken,
  name,
  email,
  keyPair: await TeacherLongTermKeyPair.generate(crypto),
});

export const getAuthenticatedNonStudentTeacherContext =
  (role: NonStudentTeacherRole): (() => Promise<AuthenticationContextType>) =>
  async () => ({
    version: latestAuthenticationContextVersion,
    role,
    idToken,
    authenticationToken,
    name,
    email,
  });
