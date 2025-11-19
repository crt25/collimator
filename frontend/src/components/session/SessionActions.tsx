import { defineMessages, useIntl } from "react-intl";
import { LuSend, LuTrash } from "react-icons/lu";
import { useContext, useState } from "react";
import { useRouter } from "next/router";
import { ButtonMessages } from "@/i18n/button-messages";
import { useDeleteClassSession } from "@/api/collimator/hooks/sessions/useDeleteClassSession";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { toaster } from "../Toaster";
import { Modal } from "../form/Modal";
import DropdownMenu from "../DropdownMenu";

const messages = defineMessages({
  copySessionLink: {
    id: "SessionActions.copySessionLink",
    defaultMessage: "Copy Lesson Link",
  },
  deleteSession: {
    id: "SessionActions.deleteSession",
    defaultMessage: "Delete Lesson",
  },
  deleteConfirmationTitle: {
    id: "SessionActions.deleteConfirmation.title",
    defaultMessage: "Delete Lesson",
  },
  deleteConfirmationBody: {
    id: "SessionActions.deleteConfirmation.body",
    defaultMessage: "Are you sure? You can't undo this action afterwards.",
  },
  deleteConfirmationConfirm: {
    id: "SessionActions.deleteConfirmation.confirm",
    defaultMessage: "Delete Lesson",
  },
  deleteConfirmationCancel: {
    id: "SessionActions.deleteConfirmation.cancel",
    defaultMessage: "Cancel",
  },
  deleteSuccessMessage: {
    id: "SessionActions.deleteSuccessMessage",
    defaultMessage: "Lesson deleted successfully",
  },
  deleteErrorMessage: {
    id: "SessionActions.deleteErrorMessage",
    defaultMessage: "There was an error deleting the lesson. Please try again!",
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
  const router = useRouter();
  const deleteSession = useDeleteClassSession();
  const authenticationContext = useContext(AuthenticationContext);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canGetSessionLink =
    "userId" in authenticationContext &&
    klass.teacher.id === authenticationContext.userId;

  const handleDeleteConfirm = async () => {
    try {
      await deleteSession(klass.id, sessionId);
      toaster.success({
        title: intl.formatMessage(messages.deleteSuccessMessage),
      });
      router.push(`/class/${klass.id}/session`);
    } catch {
      toaster.error({
        title: intl.formatMessage(messages.deleteErrorMessage),
      });
    }
  };

  return (
    <>
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
          onClick={() => setIsDeleteModalOpen(true)}
          icon={<LuTrash />}
        >
          {intl.formatMessage(messages.deleteSession)}
        </DropdownMenu.Item>
      </DropdownMenu>

      <Modal
        title={intl.formatMessage(messages.deleteConfirmationTitle)}
        description={intl.formatMessage(messages.deleteConfirmationBody)}
        confirmButtonText={intl.formatMessage(
          messages.deleteConfirmationConfirm,
        )}
        cancelButtonText={intl.formatMessage(messages.deleteConfirmationCancel)}
        onConfirm={handleDeleteConfirm}
        open={isDeleteModalOpen}
        onOpenChange={(details) => setIsDeleteModalOpen(details.open)}
      />
    </>
  );
};

export default SessionActions;
