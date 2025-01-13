import { useContext, useEffect, useMemo, useState } from "react";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { StudentIdentity } from "@/api/collimator/models/classes/class-student";
import { decodeBase64 } from "@/utilities/crypto";
import { getStudentNickname } from "@/utilities/student-name";

const logModule = "[useStudentName]";

export const useStudentName = ({
  pseudonym,
  keyPairId,
  showActualName,
}: {
  pseudonym?: string;
  keyPairId?: number | null;
  showActualName?: boolean;
}): {
  name: string | null;
  isDecrypting: boolean;
  isAnonymousUser: boolean;
} => {
  const authContext = useContext(AuthenticationContext);

  const [isDecrypting, setIsDecrypting] = useState(true);
  const [decryptedName, setDecryptedName] = useState<string | null>(null);
  const [isAnonymousUser, setIsAnonymousUser] = useState<boolean>(false);

  useEffect(() => {
    const isCancelled = false;

    if (!("keyPairId" in authContext)) {
      setIsDecrypting(false);
      return;
    }

    setIsDecrypting(true);

    const decryptName = async (): Promise<void> => {
      if (keyPairId !== authContext.keyPairId || !pseudonym) {
        // no need trying to decrypt if the key pair is not the same that was used to encrypt
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

      setIsAnonymousUser(decryptedIdentity.longTermIdentifier === null);
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
    if (!pseudonym) {
      return null;
    }

    return !showActualName || isAnonymousUser
      ? getStudentNickname(pseudonym)
      : decryptedName;
  }, [showActualName, isAnonymousUser, decryptedName, pseudonym]);

  return {
    name,
    isDecrypting,
    isAnonymousUser,
  };
};
