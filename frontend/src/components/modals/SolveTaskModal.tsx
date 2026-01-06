import { useIntl } from "react-intl";
import { useCallback, useMemo } from "react";
import { Language, Submission } from "iframe-rpc-react/src";
import { TaskType } from "@/api/collimator/generated/models";
import { jupyterAppHostName, scratchAppHostName } from "@/utilities/constants";
import { executeWithToasts } from "@/utilities/task";
import { messages as taskMessages } from "@/i18n/task-messages";
import { EmbeddedAppRef } from "../EmbeddedApp";
import TaskModal from "./TaskModal";

const getSolveUrl = (taskType: TaskType) => {
  switch (taskType) {
    case TaskType.SCRATCH:
      return `${scratchAppHostName}/solve`;
    case TaskType.JUPYTER:
      return `${jupyterAppHostName}?mode=solve`;
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
      const submission = await embeddedApp.sendRequest(
        "getSubmission",
        undefined,
      );

      onSave(submission.result);
    },
    [onSave],
  );

  const loadContent = useCallback(
    (embeddedApp: EmbeddedAppRef) => {
      if (solution && task) {
        executeWithToasts(
          () =>
            embeddedApp.sendRequest("loadSubmission", {
              task,
              submission: solution,
              language: intl.locale as Language,
            }),
          intl.formatMessage(taskMessages.taskLoaded),
          intl.formatMessage(taskMessages.cannotLoadTask),
        );
        return;
      }

      if (task) {
        executeWithToasts(
          () =>
            embeddedApp.sendRequest("loadTask", {
              task,
              language: intl.locale as Language,
            }),
          intl.formatMessage(taskMessages.taskLoaded),
          intl.formatMessage(taskMessages.cannotLoadTask),
        );
      }
    },
    [task, solution, intl],
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
