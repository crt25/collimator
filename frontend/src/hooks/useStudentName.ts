import { useContext, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Language } from "iframe-rpc-react/src";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { StudentIdentity } from "@/api/collimator/models/classes/class-student";
import { decodeBase64 } from "@/utilities/crypto";
import { getStudentNickname } from "@/utilities/student-name";
import { useStudentAnonymization } from "./useStudentAnonymization";

const logModule = "[useStudentName]";

export const useStudentName = ({
  studentId,
  pseudonym,
  keyPairId,
}: {
  studentId: number;
  pseudonym?: string | null;
  keyPairId?: number | null;
}): {
  name: string | null;
  isDecrypting: boolean;
} => {
  const authContext = useContext(AuthenticationContext);
  const intl = useIntl();

  const [anonymizationState] = useStudentAnonymization();
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [decryptedName, setDecryptedName] = useState<string | null>(null);

  useEffect(() => {
    const isCancelled = false;

    if (!("keyPairId" in authContext)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDecrypting(false);
      return;
    }

    setIsDecrypting(true);

    const decryptName = async (): Promise<void> => {
      if (keyPairId !== authContext.keyPairId || !pseudonym) {
        // no need trying to decrypt if the key pair is not the same that was used to encrypt OR
        // if the user is anonymous (no pseudonym).
        setDecryptedName(null);
        setIsDecrypting(false);

        return;
      }

      const decryptedIdentity: StudentIdentity = JSON.parse(
        await authContext.keyPair.decryptString(decodeBase64(pseudonym)),
      );

      if (isCancelled) {
        // another update has been triggered
        return;
      }

      setDecryptedName(decryptedIdentity.name);
      setIsDecrypting(false);
    };

    decryptName().catch((e) => {
      console.error(
        `${logModule} Student identity decryption failed`,
        e,
        pseudonym,
        keyPairId,
        authContext.keyPairId,
      );

      setDecryptedName(null);

      if (isCancelled) {
        // another update has been triggered
        return;
      }

      setIsDecrypting(false);
    });
  }, [authContext, pseudonym, keyPairId]);

  const name = useMemo(() => {
    return !anonymizationState.showActualName || !pseudonym
      ? getStudentNickname(studentId, pseudonym, intl.locale as Language)
      : decryptedName;
  }, [
    anonymizationState.showActualName,
    decryptedName,
    studentId,
    pseudonym,
    intl.locale,
  ]);

  return {
    name,
    isDecrypting,
  };
};
