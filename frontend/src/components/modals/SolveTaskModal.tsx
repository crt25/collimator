import { useIntl } from "react-intl";
import { useCallback, useMemo } from "react";
import { Language, Submission } from "app-iframe-message-react/src";
import { TaskType } from "@/api/collimator/generated/models";
import { scratchAppHostName } from "@/utilities/constants";
import { EmbeddedAppRef } from "../EmbeddedApp";
import TaskModal from "./TaskModal";

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
  onSave: (submission: Submission) => void;
  taskType: TaskType;
  task?: Blob | null;
  solution?: Blob | null;
}) => {
  const intl = useIntl();
  const url = useMemo(() => getSolveUrl(taskType), [taskType]);

  const onSaveSolution = useCallback(
    async (embeddedApp: EmbeddedAppRef) => {
      const submission = await embeddedApp.sendRequest({
        procedure: "getSubmission",
        arguments: undefined,
      });

      onSave(submission.result);
    },
    [onSave],
  );

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
      onSave={onSaveSolution}
    />
  );
};

export default SolveTaskModal;
