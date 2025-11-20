import { defineMessages, useIntl } from "react-intl";
import { LuTrash } from "react-icons/lu";
import { useState } from "react";
import { useRouter } from "next/router";
import { useDeleteTask } from "@/api/collimator/hooks/tasks/useDeleteTask";
import { ButtonMessages } from "@/i18n/button-messages";
import DropdownMenu from "../DropdownMenu";
import { toaster } from "../Toaster";
import { Modal } from "../form/Modal";

const messages = defineMessages({
  deleteTask: {
    id: "TaskActions.deleteTask",
    defaultMessage: "Delete Task",
  },
  deleteConfirmationTitle: {
    id: "TaskActions.deleteConfirmation.title",
    defaultMessage: "Delete Task",
  },
  deleteConfirmationBody: {
    id: "TaskActions.deleteConfirmation.body",
    defaultMessage: "Are you sure? You can't undo this action afterwards.",
  },
  deleteConfirmationConfirm: {
    id: "TaskActions.deleteConfirmation.confirm",
    defaultMessage: "Delete Task",
  },
  deleteConfirmationCancel: {
    id: "TaskActions.deleteConfirmation.cancel",
    defaultMessage: "Cancel",
  },
  deleteSuccessMessage: {
    id: "TaskActions.deleteSuccessMessage",
    defaultMessage: "Task deleted successfully",
  },
  deleteErrorMessage: {
    id: "TaskActions.deleteErrorMessage",
    defaultMessage: "There was an error deleting the task. Please try again!",
  },
});

const TaskActions = ({ taskId }: { taskId: number }) => {
  const intl = useIntl();
  const router = useRouter();
  const deleteTask = useDeleteTask();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      await deleteTask(taskId);
      toaster.success({
        title: intl.formatMessage(messages.deleteSuccessMessage),
      });
      router.push(`/task`);
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
        <DropdownMenu.Item
          onClick={() => setIsDeleteModalOpen(true)}
          icon={<LuTrash />}
        >
          {intl.formatMessage(messages.deleteTask)}
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

export default TaskActions;
