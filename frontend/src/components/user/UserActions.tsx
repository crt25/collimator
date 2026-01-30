import { defineMessages, useIntl } from "react-intl";
import { LuLink, LuTrash } from "react-icons/lu";
import { useRouter } from "next/router";
import { useState } from "react";
import { toaster } from "@/components/Toaster";
import { ExistingUser } from "@/api/collimator/models/users/existing-user";
import { useDeleteUser } from "@/api/collimator/hooks/users/useDeleteUser";
import { useGenerateRegistrationToken } from "@/api/collimator/hooks/users/useGenerateRegistrationToken";
import { ButtonMessages } from "@/i18n/button-messages";
import { Modal } from "@/components/form/Modal";
import DropdownMenu from "../DropdownMenu";

const messages = defineMessages({
  deleteUser: {
    id: "UserActions.deleteUser",
    defaultMessage: "Delete User",
  },
  generateRegistrationToken: {
    id: "UserActions.generateRegistrationToken",
    defaultMessage: "Get registration link",
  },
  deleteConfirmationTitle: {
    id: "UserActions.deleteConfirmation.title",
    defaultMessage: "Delete User",
  },
  deleteConfirmationBody: {
    id: "UserActions.deleteConfirmation.body",
    defaultMessage: "Are you sure you want to delete this user?",
  },
  deleteConfirmationConfirm: {
    id: "UserActions.deleteConfirmation.confirm",
    defaultMessage: "Delete User",
  },
  deleteSuccess: {
    id: "UserActions.deleteSuccess",
    defaultMessage: "User deleted successfully",
  },
  deleteError: {
    id: "UserActions.deleteError",
    defaultMessage: "There was an error deleting the user. Please try again!",
  },
  deleteCancel: {
    id: "UserActions.deleteCancel",
    defaultMessage: "Cancel",
  },
});

const UserActions = ({ user }: { user: ExistingUser }) => {
  const intl = useIntl();

  const router = useRouter();
  const deleteUser = useDeleteUser();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const generateRegistrationToken = useGenerateRegistrationToken();

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(user.id);
      toaster.success({
        title: intl.formatMessage(messages.deleteSuccess),
      });
      router.push(`/user`);
    } catch {
      toaster.error({
        title: intl.formatMessage(messages.deleteError),
      });
    }
  };

  return (
    <>
      <DropdownMenu
        trigger={intl.formatMessage(ButtonMessages.actions)}
        variant="emphasized"
        testId={`user-${user.id}-actions-dropdown-button`}
      >
        <DropdownMenu.Item
          onClick={() => setIsDeleteModalOpen(true)}
          icon={<LuTrash />}
          testId={`user-${user.id}-delete-button`}
        >
          {intl.formatMessage(messages.deleteUser)}
        </DropdownMenu.Item>
        {user.oidcSub === null && (
          <DropdownMenu.Item
            onClick={async () => {
              const token = await generateRegistrationToken(user.id);

              navigator.clipboard.writeText(
                `${window.location.origin}/login?registrationToken=${token}`,
              );
            }}
            icon={<LuLink />}
            testId={`user-${user.id}-generate-registration-token-button`}
          >
            {intl.formatMessage(messages.generateRegistrationToken)}
          </DropdownMenu.Item>
        )}
      </DropdownMenu>

      <Modal
        title={intl.formatMessage(messages.deleteConfirmationTitle)}
        description={intl.formatMessage(messages.deleteConfirmationBody)}
        confirmButtonText={intl.formatMessage(
          messages.deleteConfirmationConfirm,
        )}
        cancelButtonText={intl.formatMessage(messages.deleteCancel)}
        onConfirm={handleDeleteConfirm}
        open={isDeleteModalOpen}
        onOpenChange={(details) => setIsDeleteModalOpen(details.open)}
      />
    </>
  );
};

export default UserActions;
