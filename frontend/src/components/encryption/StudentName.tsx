import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { getStudentNickname } from "@/utilities/student-name";
import { useStudentName } from "@/hooks/useStudentName";

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
  studentId,
  pseudonym,
  keyPairId,
  showActualName,
  testId,
}: {
  studentId: number;
  pseudonym?: string | null;
  keyPairId?: number | null;
  showActualName?: boolean;
  testId?: string;
}) => {
  const intl = useIntl();

  const { isAnonymousUser, isDecrypting, name } = useStudentName({
    studentId,
    keyPairId,
    pseudonym,
    showActualName,
  });

  if (isDecrypting) {
    return (
      <NameWrapper data-testid={testId}>
        <FormattedMessage
          id="StudentName.decrypting"
          defaultMessage="Decrypting..."
        />
      </NameWrapper>
    );
  }

  if (name === null) {
    return (
      <NameWrapper data-testid={testId}>
        {getStudentNickname(studentId, pseudonym)}{" "}
        <FontAwesomeIcon
          icon={faInfoCircle}
          title={intl.formatMessage(messages.cannotDecrypt)}
        />
      </NameWrapper>
    );
  }

  return (
    <NameWrapper data-testid={testId}>
      {name}
      {isAnonymousUser && showActualName
        ? " (" + intl.formatMessage(messages.anonymous) + ")"
        : ""}
    </NameWrapper>
  );
};
