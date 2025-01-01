import { useContext, useEffect, useMemo, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { StudentIdentity } from "@/api/collimator/models/classes/class-student";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { decodeBase64 } from "@/utilities/crypto/base64";
import { getStudentNickname } from "@/utilities/student-name";

const NameWrapper = styled.span``;

const logModule = "[StudentName]";

const messages = defineMessages({
  cannotDecrypt: {
    id: "StudentName.cannotDecrypt",
    defaultMessage: "Unable to decrypt identity",
  },
  anonymous: {
    id: "StudentName.anonymous",
    defaultMessage: "Anonymous",
  },
});

export const StudentName = ({
  pseudonym,
  keyPairId,
  showActualName,
}: {
  pseudonym: string;
  keyPairId: number | null;
  showActualName?: boolean;
}) => {
  const intl = useIntl();
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

    const decryptName = async () => {
      if (keyPairId !== authContext.keyPairId) {
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

  const name = useMemo(
    () =>
      !showActualName || isAnonymousUser
        ? getStudentNickname(pseudonym)
        : decryptedName,
    [showActualName, isAnonymousUser, decryptedName, pseudonym],
  );

  if (isDecrypting) {
    return (
      <NameWrapper>
        <FormattedMessage
          id="StudentName.decrypting"
          defaultMessage="Decrypting..."
        />
      </NameWrapper>
    );
  }

  if (name === null) {
    return (
      <NameWrapper>
        {getStudentNickname(pseudonym)}{" "}
        <FontAwesomeIcon
          icon={faInfoCircle}
          title={intl.formatMessage(messages.cannotDecrypt)}
        />
      </NameWrapper>
    );
  }

  return (
    <NameWrapper>
      {name}
      {isAnonymousUser
        ? " (" + intl.formatMessage(messages.anonymous) + ")"
        : ""}
    </NameWrapper>
  );
};
