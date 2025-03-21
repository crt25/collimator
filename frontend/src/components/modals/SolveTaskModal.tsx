import { useIntl } from "react-intl";
import { useCallback, useMemo } from "react";
import { EmbeddedAppRef } from "../EmbeddedApp";
import TaskModal from "./TaskModal";
import { Language } from "@/types/app-iframe-message/languages";
import { GetSubmissionResponse } from "@/types/app-iframe-message/get-submission";
import { TaskType } from "@/api/collimator/generated/models";
import { scratchAppHostName } from "@/utilities/constants";

const getSolveUrl = (taskType: TaskType) => {
  switch (taskType) {
    case TaskType.SCRATCH:
      return `${scratchAppHostName}/solve`;
    default:
      return null;
  }
};

const SolveTaskModal = ({
  isShown,
  setIsShown,
  onSave,
  taskType,
  task,
  solution,
}: {
  isShown: boolean;
  setIsShown: (isShown: boolean) => void;
  onSave: (taskFile: Blob, submission: GetSubmissionResponse["result"]) => void;
  taskType: TaskType;
  task?: Blob | null;
  solution?: Blob | null;
}) => {
  const intl = useIntl();
  const url = useMemo(() => getSolveUrl(taskType), [taskType]);

  const loadContent = useCallback(
    (embeddedApp: EmbeddedAppRef) => {
      if (solution && task) {
        embeddedApp.sendRequest({
          procedure: "loadSubmission",
          arguments: {
            task,
            submission: solution,
            language: intl.locale as Language,
          },
        });
        return;
      }

      if (task) {
        embeddedApp.sendRequest({
          procedure: "loadTask",
          arguments: {
            task,
            language: intl.locale as Language,
          },
        });
      }
    },
    [task, solution, intl.locale],
  );

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

export default SolveTaskModal;
