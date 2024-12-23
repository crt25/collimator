import { StudentIdentity } from "@/api/collimator/models/classes/class-student";
import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { decodeBase64 } from "@/utilities/crypto/base64";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const NameWrapper = styled.span``;

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
}: {
  pseudonym: string;
  keyPairId: number | null;
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
        "Decryption failed",
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

  if (decryptedName === null) {
    return (
      <NameWrapper>
        {pseudonym}{" "}
        <FontAwesomeIcon
          icon={faInfoCircle}
          title={intl.formatMessage(messages.cannotDecrypt)}
        />
      </NameWrapper>
    );
  }

  return (
    <NameWrapper>
      {decryptedName}
      {isAnonymousUser
        ? " (" + intl.formatMessage(messages.anonymous) + ")"
        : ""}
    </NameWrapper>
  );
};
