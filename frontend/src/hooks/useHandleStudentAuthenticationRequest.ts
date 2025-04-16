import { useCallback } from "react";
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

const findOrCreatePseudonym = async (
  longTermIdentifier: string,
  name: string,
  klass: ExistingClassExtended,
  keyPair: TeacherLongTermKeyPair,
): Promise<string> => {
  // try to decrypt all students in the class
  let matchingPseudonyms: (string | false)[] = [];

  matchingPseudonyms = await Promise.all(
    klass.students.map(async (student) => {
      try {
        const decryptedIdentity = JSON.parse(
          await keyPair.decryptString(decodeBase64(student.pseudonym)),
        ) as StudentIdentity;

        return decryptedIdentity.longTermIdentifier === longTermIdentifier
          ? student.pseudonym
          : false;
      } catch {
        // we failed to decrypt the student, so we just return false as if the identity did not match
        return false;
      }
    }),
  );

  // Should multiple students have the same long term identity, we take the first one.
  // In practice, this should never happen as it means that the same long term identity was encrypted
  // with the same key. This exact code is here to make sure that if there is an existing
  // student with the same long term identity, we assign them the same pseudonym.
  const matchingPseudonym = matchingPseudonyms.find(
    (pseudonym) => pseudonym !== false,
  );

  return (
    matchingPseudonym ??
    // If no matching pseudonym was found, we create a new one.
    encodeBase64(
      await keyPair.encryptString(
        JSON.stringify({
          longTermIdentifier,
          name,
        } satisfies StudentIdentity),
      ),
    )
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
      const [{ longTermIdentifier, name }, klass] = await Promise.all([
        verifyJwtToken(
          authenticationRequest.idToken,
          openIdConnectMicrosoftClientId,
        ).then((verifiedToken) => {
          const longTermIdentifier = verifiedToken.payload["sub"];
          const name = verifiedToken.payload["name"];

          if (!longTermIdentifier) {
            throw new Error(
              "Received student id token does not contain a 'sub' claim",
            );
          }

          if (!name || typeof name !== "string") {
            throw new Error(
              "Received student id token does not contain a 'name' claim",
            );
          }

          return {
            longTermIdentifier: longTermIdentifier,
            name: name,
          };
        }),
        fetchClass(authenticationRequest.classId),
      ]);

      if (klass.teacher.id !== authContext.userId) {
        throw new Error(
          "We can only authenticate students in classes that we are the teacher of",
        );
      }

      const pseudonym = await findOrCreatePseudonym(
        longTermIdentifier,
        name,
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
