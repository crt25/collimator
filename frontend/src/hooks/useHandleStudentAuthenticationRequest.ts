import { useAuthenticateStudent } from "@/api/collimator/hooks/authentication/useAuthenticateStudent";
import { useFetchClass } from "@/api/collimator/hooks/classes/useFetchClass";
import { StudentIdentity } from "@/api/collimator/models/classes/class-student";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { AdminOrTeacherAuthenticated } from "@/contexts/AuthenticationContext";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  StudentAuthenticationRequestContent,
} from "@/types/websocket-events";
import { verifyJwtToken } from "@/utilities/authentication/jwt";
import { openIdConnectMicrosoftClientId } from "@/utilities/constants";
import { decodeBase64, encodeBase64 } from "@/utilities/crypto/base64";
import TeacherLongTermKeyPair from "@/utilities/crypto/TeacherLongTermKeyPair";
import { useCallback } from "react";

const findOrCreatePseudonym = async (
  verifiedToken: Awaited<ReturnType<typeof verifyJwtToken>>,
  klass: ExistingClassExtended,
  keyPair: TeacherLongTermKeyPair,
): Promise<string> => {
  const longTermIdentifier = verifiedToken.payload["sub"];
  const name = verifiedToken.payload["name"];

  // try to decrypt all students in the class
  const matchingPseudonyms = await Promise.all(
    klass.students.map(async (student) => {
      try {
        const decryptedIdentity = JSON.parse(
          await keyPair.decryptString(decodeBase64(student.pseudonym)),
        ) as StudentIdentity;

        return decryptedIdentity.longTermIdentifier === longTermIdentifier
          ? student.pseudonym
          : null;
      } catch {
        // we failed to decrypt the student, so we just return null as if the identity did not match
        return null;
      }
    }),
  );

  // Should multiple students have the same long term identity, we take the first one.
  // In practice, this should never happen as it means that the same long term identity was encrypted
  // with the same key. This exact code is here to make sure that if there is an existing
  // student with the same long term identity, we assign them the same pseudonym.
  const matchingPseudonym = matchingPseudonyms.find(
    (pseudonym) => pseudonym !== null,
  );

  return matchingPseudonym
    ? matchingPseudonym
    : encodeBase64(
        await keyPair.encryptString(
          JSON.stringify({
            longTermIdentifier,
            name,
          } as StudentIdentity),
        ),
      );
};

type Input = Parameters<
  ServerToClientEvents["requestTeacherToSignInStudent"]
>[0];

type Output = Parameters<ClientToServerEvents["studentAuthenticationToken"]>[0];

type CallbackType = (
  authContext: AdminOrTeacherAuthenticated,
  input: Input,
) => Promise<Output>;

export const useHandleStudentAuthenticationRequest = (): CallbackType => {
  const fetchClass = useFetchClass();
  const authenticateStudent = useAuthenticateStudent();

  return useCallback<CallbackType>(
    async (
      authContext,
      { encryptedAuthenticationRequest, socketId, studentPublicKey }: Input,
    ) => {
      const ephemeralKey = await authContext.keyPair.deriveSharedEphemeralKey(
        JSON.parse(studentPublicKey),
      );

      const authenticationRequest = JSON.parse(
        await ephemeralKey.decryptString(
          decodeBase64(encryptedAuthenticationRequest),
        ),
      ) as StudentAuthenticationRequestContent;

      // verify the received id token and fetch the class
      const [verifiedToken, klass] = await Promise.all([
        verifyJwtToken(
          authenticationRequest.idToken,
          openIdConnectMicrosoftClientId,
        ),
        fetchClass(authenticationRequest.classId),
      ]);

      if (klass.teacher.id !== authContext.userId) {
        throw new Error(
          "We can only authenticate students in classes that we are the teacher of",
        );
      }

      const pseudonym = await findOrCreatePseudonym(
        verifiedToken,
        klass,
        authContext.keyPair,
      );

      const response = await authenticateStudent({
        classId: klass.id,
        pseudonym,
        keyPairId: authContext.keyPairId,
      });

      return {
        socketId,
        authenticationToken: encodeBase64(
          await ephemeralKey.encryptString(response.authenticationToken),
        ),
      };
    },
    [authenticateStudent, fetchClass],
  );
};
