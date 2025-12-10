import { defineMessages, useIntl } from "react-intl";
import { LuTrash } from "react-icons/lu";
import { useRouter } from "next/router";
import { useState } from "react";
import { ButtonMessages } from "@/i18n/button-messages";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { useDeleteClass } from "@/api/collimator/hooks/classes/useDeleteClass";
import { Modal } from "@/components/form/Modal";
import { ClassDeleteModalMessages } from "@/i18n/session-delete-modal-messages";
import { toaster } from "@/components/Toaster";
import DropdownMenu from "../DropdownMenu";

const messages = defineMessages({
  deleteClass: {
    id: "ClassActions.deleteClass",
    defaultMessage: "Delete Class",
  },
});

const ClassActions = ({ klass }: { klass: ExistingClassExtended }) => {
  const intl = useIntl();

  const router = useRouter();
  const deleteClass = useDeleteClass();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      await deleteClass(klass.id);
      toaster.success({
        title: intl.formatMessage(ClassDeleteModalMessages.success),
      });
      router.push(`/class`);
    } catch {
      toaster.error({
        title: intl.formatMessage(ClassDeleteModalMessages.error),
      });
    }
  };

  return (
    <>
      <DropdownMenu
        trigger={intl.formatMessage(ButtonMessages.actions)}
        variant="emphasized"
        testId={`class-${klass.id}-actions-dropdown-button`}
      >
        <DropdownMenu.Item
          onClick={() => setIsDeleteModalOpen(true)}
          icon={<LuTrash />}
          testId={`class-${klass.id}-delete-button`}
        >
          {intl.formatMessage(messages.deleteClass)}
        </DropdownMenu.Item>
      </DropdownMenu>

      <Modal
        title={intl.formatMessage(ClassDeleteModalMessages.title)}
        description={intl.formatMessage(ClassDeleteModalMessages.body)}
        confirmButtonText={intl.formatMessage(ClassDeleteModalMessages.confirm)}
        cancelButtonText={intl.formatMessage(ClassDeleteModalMessages.cancel)}
        onConfirm={handleDeleteConfirm}
        open={isDeleteModalOpen}
        onOpenChange={(details) => setIsDeleteModalOpen(details.open)}
      />
    </>
  );
};

export default ClassActions;
