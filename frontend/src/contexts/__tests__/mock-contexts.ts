import StudentKeyPair from "@/utilities/crypto/StudentKeyPair";
import {
  authenticationContextDefaultValue,
  AuthenticationContextType,
  latestAuthenticationContextVersion,
} from "../AuthenticationContext";
import TeacherLongTermKeyPair from "@/utilities/crypto/TeacherLongTermKeyPair";
import { UserRole } from "@/types/user/user-role";

const userId = 1;
const name = "John";
const email = "john@doe.com";
const authenticationToken = "authenticationToken";
const idToken = "id token";

type AdminRole = Exclude<UserRole, UserRole.teacher | UserRole.student>;

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
): Promise<AuthenticationContextType> => {
  const teacherKeyPair = await TeacherLongTermKeyPair.generate(crypto);
  const keyPair = await StudentKeyPair.generate(crypto);

  return {
    version: latestAuthenticationContextVersion,
    role: UserRole.student,
    idToken,
    authenticationToken,
    name,
    email,
    sessionId: 1,
    keyPair,
    ephemeralKey: await keyPair.deriveSharedEphemeralKey(
      await teacherKeyPair.exportPublicKey(),
      await teacherKeyPair.getPublicKeyFingerprint(),
    ),
  };
};

export const getAuthenticatedTeacherContext = async (
  crypto: SubtleCrypto,
): Promise<AuthenticationContextType> => ({
  version: latestAuthenticationContextVersion,
  role: UserRole.teacher,
  idToken,
  authenticationToken,
  name,
  email,
  userId,
  keyPair: await TeacherLongTermKeyPair.generate(crypto),
  keyPairId: 1,
});

export const getAuthenticatedAdminContext =
  (
    role: AdminRole,
  ): ((crypto: SubtleCrypto) => Promise<AuthenticationContextType>) =>
  async (crypto: SubtleCrypto) => ({
    version: latestAuthenticationContextVersion,
    role,
    idToken,
    authenticationToken,
    name,
    email,
    userId,
    keyPair: await TeacherLongTermKeyPair.generate(crypto),
    keyPairId: 1,
  });
