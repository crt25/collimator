import { defineMessages, useIntl } from "react-intl";
import { LuSend, LuTrash } from "react-icons/lu";
import { useContext } from "react";
import DropdownMenu from "../DropdownMenu";
import { ButtonMessages } from "@/i18n/button-messages";
import { useDeleteClassSession } from "@/api/collimator/hooks/sessions/useDeleteClassSession";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";

const messages = defineMessages({
  copySessionLink: {
    id: "SessionActions.copySessionLink",
    defaultMessage: "Copy Lesson Link",
  },
  deleteSession: {
    id: "SessionActions.deleteSession",
    defaultMessage: "Delete Lesson",
  },
});

const SessionActions = ({
  klass,
  sessionId,
}: {
  klass: ExistingClassExtended;
  sessionId: number;
}) => {
  const intl = useIntl();
  const deleteSession = useDeleteClassSession();
  const authenticationContext = useContext(AuthenticationContext);

  const canGetSessionLink =
    "userId" in authenticationContext &&
    klass.teacher.id === authenticationContext.userId;

  return (
    <DropdownMenu
      trigger={intl.formatMessage(ButtonMessages.actions)}
      variant="emphasized"
    >
      {canGetSessionLink && (
        <DropdownMenu.Item
          onClick={async () => {
            const fingerprint =
              await authenticationContext.keyPair.getPublicKeyFingerprint();

            navigator.clipboard.writeText(
              `${window.location.origin}/class/${klass.id}/session/${sessionId}/join?key=${fingerprint}`,
            );
          }}
          icon={<LuSend />}
        >
          {intl.formatMessage(messages.copySessionLink)}
        </DropdownMenu.Item>
      )}
      <DropdownMenu.Item
        onClick={() => deleteSession(klass.id, sessionId)}
        icon={<LuTrash />}
      >
        {intl.formatMessage(messages.deleteSession)}
      </DropdownMenu.Item>
    </DropdownMenu>
  );
};

export default SessionActions;
