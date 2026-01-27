import { useIntl } from "react-intl";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Language, Task } from "iframe-rpc-react/src";
import { jupyterAppHostName, scratchAppHostName } from "@/utilities/constants";
import { TaskType } from "@/api/collimator/generated/models";
import { executeAsyncWithToasts, executeWithToasts } from "@/utilities/task";
import { messages as taskMessages } from "@/i18n/task-messages";
import { EmbeddedAppRef } from "../EmbeddedApp";
import TaskModal from "./TaskModal";

const getEditUrl = (taskType: TaskType) => {
  switch (taskType) {
    case TaskType.SCRATCH:
      return `${scratchAppHostName}/edit`;
    case TaskType.JUPYTER:
      return `${jupyterAppHostName}?mode=edit`;
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
  onSave: (task: Task) => void;
  taskType: TaskType;
  initialTask?: Blob | null;
}) => {
  const intl = useIntl();
  const url = useMemo(() => getEditUrl(taskType), [taskType]);
  const wasInitialized = useRef(false);

  const onSaveTask = useCallback(
    async (embeddedApp: EmbeddedAppRef) => {
      const task = await executeAsyncWithToasts(
        () => embeddedApp.sendRequest("getTask", undefined),
        intl.formatMessage(taskMessages.cannotSaveTask),
      );
      onSave(task.result);
    },
    [onSave, intl],
  );

  const loadContent = useCallback(
    (embeddedApp: EmbeddedAppRef) => {
      if (wasInitialized.current) {
        embeddedApp.sendRequest("setLocale", intl.locale as Language);
        return;
      }
      wasInitialized.current = true;

      if (initialTask && initialTask.size > 0) {
        executeWithToasts(
          () =>
            embeddedApp.sendRequest("loadTask", {
              task: initialTask,
              language: intl.locale as Language,
            }),
          intl.formatMessage(taskMessages.cannotLoadTask),
        );
      }
    },
    [initialTask, intl],
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
      onSave={onSaveTask}
    />
  );
};

export default EditTaskModal;
