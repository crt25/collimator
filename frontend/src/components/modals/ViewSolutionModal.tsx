import { FormattedMessage, useIntl } from "react-intl";
import React, { useCallback, useMemo } from "react";
import { Language } from "iframe-rpc-react/src";
import { jupyterAppHostName, scratchAppHostName } from "@/utilities/constants";
import { TaskType } from "@/api/collimator/generated/models";
import { useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import { useSolutionFile } from "@/api/collimator/hooks/solutions/useSolution";
import { executeAsyncWithToasts } from "@/utilities/task";
import { messages as taskMessages } from "@/i18n/task-messages";
import { EmbeddedAppRef } from "../EmbeddedApp";
import MultiSwrContent from "../MultiSwrContent";
import TaskModal from "./TaskModal";

const getViewUrl = (taskType: TaskType) => {
  switch (taskType) {
    case TaskType.SCRATCH:
      return `${scratchAppHostName}/solve`;
    case TaskType.JUPYTER:
      return `${jupyterAppHostName}?mode=solve`;
    default:
      return null;
  }
};

const ViewSolutionModal = ({
  isShown,
  setIsShown,
  classId,
  sessionId,
  taskId,
  solutionHash,
  taskType,
  header,
  footer,
}: {
  isShown: boolean;
  setIsShown: (isShown: boolean) => void;
  classId: number;
  sessionId: number;
  taskId: number;
  solutionHash: string;
  taskType: TaskType;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) => {
  const intl = useIntl();
  const url = useMemo(() => getViewUrl(taskType), [taskType]);

  const {
    data: taskFile,
    isLoading: isLoadingTaskFile,
    error: taskFileError,
  } = useTaskFile(taskId);

  const {
    data: solutionFile,
    isLoading: isLoadingSolutionFile,
    error: solutionFileError,
  } = useSolutionFile(classId, sessionId, taskId, solutionHash);

  const loadContent = useCallback(
    (embeddedApp: EmbeddedAppRef) => {
      if (taskFile && solutionFile) {
        executeAsyncWithToasts(
          () =>
            embeddedApp.sendRequest("loadSubmission", {
              task: taskFile,
              submission: solutionFile,
              language: intl.locale as Language,
            }),
          { intl, descriptor: taskMessages.cannotLoadTask },
        );
      }
    },
    [taskFile, solutionFile, intl],
  );

  if (!isShown) {
    return null;
  }

  return (
    <MultiSwrContent
      data={[taskFile, solutionFile]}
      isLoading={[isLoadingTaskFile, isLoadingSolutionFile]}
      errors={[taskFileError, solutionFileError]}
    >
      {() => (
        <TaskModal
          title={
            <FormattedMessage
              id="ViewSolutionModal.title"
              defaultMessage="View solution"
            />
          }
          isShown={isShown}
          setIsShown={setIsShown}
          url={url}
          loadContent={loadContent}
          showResetButton
          header={header}
          footer={footer}
        />
      )}
    </MultiSwrContent>
  );
};

export default ViewSolutionModal;
