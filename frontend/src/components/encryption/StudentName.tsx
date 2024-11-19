import {
  ClassStudent,
  StudentIdentity,
} from "@/api/collimator/models/classes/class-student";
import { useContext, useEffect, useRef, useState } from "react";
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
});

const generateRandomNumber = () => Math.floor(Math.random() * 100);

export const StudentName = ({ student }: { student: ClassStudent }) => {
  const intl = useIntl();
  const authContext = useContext(AuthenticationContext);

  const latestId = useRef<number>(-1);
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [decryptedName, setDecryptedName] = useState<string | null>(null);

  useEffect(() => {
    const currentId = generateRandomNumber();
    latestId.current = currentId;

    if (!("keyPair" in authContext)) {
      setIsDecrypting(false);
      return;
    }

    setIsDecrypting(true);

    const decryptName = async () => {
      const decryptedIdentity: StudentIdentity = JSON.parse(
        await authContext.keyPair.decryptString(
          decodeBase64(student.pseudonym),
        ),
      );

      if (latestId.current !== currentId) {
        // another update has been triggered
        return;
      }

      setDecryptedName(decryptedIdentity.name);
      setIsDecrypting(false);
    };

    decryptName().catch(() => {
      if (latestId.current !== currentId) {
        // another update has been triggered
        return;
      }

      setIsDecrypting(false);
    });
  }, [authContext, student]);

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
        {student.pseudonym}{" "}
        <FontAwesomeIcon
          icon={faInfoCircle}
          title={intl.formatMessage(messages.cannotDecrypt)}
        />
      </NameWrapper>
    );
  }

  return <NameWrapper>{decryptedName}</NameWrapper>;
};
