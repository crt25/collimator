import { defineMessages, useIntl } from "react-intl";
import { LuDownload, LuTrash } from "react-icons/lu";
import { useState } from "react";
import { useRouter } from "next/router";
import { useDeleteTask } from "@/api/collimator/hooks/tasks/useDeleteTask";
import { ConflictError } from "@/api/fetch";
import { getErrorMessageDescriptor } from "@/errors/errorMessages";
import { ButtonMessages } from "@/i18n/button-messages";
import { downloadBlob } from "@/utilities/download";
import { messages as taskMessages } from "@/i18n/task-messages";
import { useIsCreatorOrAdmin } from "@/hooks/useIsCreatorOrAdmin";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import { TaskType } from "@/api/collimator/generated/models";
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
  exportError: {
    id: "TaskActions.exportError",
    defaultMessage:
      "An unexpected error happened while exporting the task. Please try again!",
  },
  taskIsAlreadyInUseMessage: {
    id: "TaskActions.taskIsAlreadyInUseMessage",
    defaultMessage:
      "This task cannot be deleted because it is currently in use by one or more classes.",
  },
});

const TaskActions = ({
  task,
  taskFile,
}: {
  task: ExistingTask;
  taskFile: Blob;
}) => {
  const intl = useIntl();
  const router = useRouter();
  const deleteTask = useDeleteTask();
  const isCreatorOrAdmin = useIsCreatorOrAdmin(task.creatorId);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const getTaskExportFilename = (taskType: TaskType): string => {
    switch (taskType) {
      case TaskType.SCRATCH:
        return "ClassMosaicExportedScratchTask.sb3";
      case TaskType.JUPYTER:
        return "ClassMosaicExportedJupyterTask.zip";
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (task?.isInUse) {
        toaster.error({
          id: `task-delete-in-use-${task.id}`,
          title: intl.formatMessage(messages.taskIsAlreadyInUseMessage),
        });
        return;
      }

      await deleteTask(task.id);

      toaster.success({
        id: `task-delete-success-${task.id}`,
        title: intl.formatMessage(messages.deleteSuccessMessage),
      });
      router.push(`/task`);
    } catch (error) {
      if (error instanceof ConflictError) {
        toaster.error({
          id: `task-delete-conflict-${task.id}`,
          title: intl.formatMessage(getErrorMessageDescriptor(error.errorCode)),
        });
      } else {
        toaster.error({
          id: `task-delete-error-${task.id}`,
          title: intl.formatMessage(messages.deleteErrorMessage),
        });
      }
    }
  };

  const onExportTask = () => {
    try {
      downloadBlob(taskFile, getTaskExportFilename(task.type));
    } catch (error) {
      console.error(error);
      toaster.error({
        id: `task-export-error-${task.id}`,
        title: intl.formatMessage(messages.exportError),
      });
    }
  };

  return (
    <>
      <DropdownMenu
        trigger={intl.formatMessage(ButtonMessages.actions)}
        variant="emphasized"
        testId={`task-${task.id}-actions-dropdown-button`}
      >
        <DropdownMenu.Item
          onClick={onExportTask}
          icon={<LuDownload />}
          testId={`task-${task.id}-export-button`}
        >
          {intl.formatMessage(taskMessages.exportTask)}
        </DropdownMenu.Item>
        {isCreatorOrAdmin && !task.isInUse && (
          <DropdownMenu.Item
            onClick={() => setIsDeleteModalOpen(true)}
            icon={<LuTrash />}
            testId={`task-${task.id}-delete-button`}
          >
            {intl.formatMessage(messages.deleteTask)}
          </DropdownMenu.Item>
        )}
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
