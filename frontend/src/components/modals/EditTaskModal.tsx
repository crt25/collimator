import { useIntl } from "react-intl";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { scratchAppHostName } from "@/utilities/constants";
import { TaskType } from "@/api/collimator/generated/models";
import { Language } from "@/types/app-iframe-message/languages";
import { EmbeddedAppRef } from "../EmbeddedApp";
import TaskModal from "./TaskModal";

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
  const intl = useIntl();
  const url = useMemo(() => getEditUrl(taskType), [taskType]);
  const wasInitialized = useRef(false);

  const loadContent = useCallback(
    (embeddedApp: EmbeddedAppRef) => {
      if (wasInitialized.current) {
        embeddedApp.sendRequest({
          procedure: "setLocale",
          arguments: intl.locale as Language,
        });
        return;
      }
      wasInitialized.current = true;

      if (initialTask) {
        embeddedApp.sendRequest({
          procedure: "loadTask",
          arguments: {
            task: initialTask,
            language: intl.locale as Language,
          },
        });
      }
    },
    [initialTask, intl.locale],
  );

  useEffect(() => {
    // reset after closing / opening
    wasInitialized.current = false;
  }, [isShown]);

  return (
    <TaskModal
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
