import { FormattedMessage } from "react-intl";
import { useCallback, useMemo } from "react";
import { scratchAppHostName } from "@/utilities/constants";
import { TaskType } from "@/api/collimator/generated/models";
import TaskModal from "./TaskModal";
import { EmbeddedAppRef } from "../EmbeddedApp";

const getEditUrl = (taskType: TaskType) => {
  switch (taskType) {
    case TaskType.SCRATCH:
      return `${scratchAppHostName}/edit`;
    default:
      return null;
  }
};

const EditTaskModal = ({
  isShown,
  setIsShown,
  onSave,
  taskType,
  initialTask,
}: {
  isShown: boolean;
  setIsShown: (isShown: boolean) => void;
  onSave: (blob: Blob) => void;
  taskType: TaskType;
  initialTask?: Blob | null;
}) => {
  const url = useMemo(() => getEditUrl(taskType), [taskType]);

  const loadContent = useCallback(
    (embeddedApp: EmbeddedAppRef) => {
      if (initialTask) {
        embeddedApp.sendRequest({
          procedure: "loadTask",
          arguments: initialTask,
        });
      }
    },
    [initialTask],
  );

  return (
    <TaskModal
      title={
        <FormattedMessage id="EditTaskModal.title" defaultMessage="Edit task" />
      }
      isShown={isShown}
      setIsShown={setIsShown}
      url={url}
      loadContent={loadContent}
      showExportButton
      showImportButton
      showSaveButton
      onSave={onSave}
    />
  );
};

export default EditTaskModal;
