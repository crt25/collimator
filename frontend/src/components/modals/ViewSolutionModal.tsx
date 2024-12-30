import { FormattedMessage, useIntl } from "react-intl";
import React, { useCallback, useMemo } from "react";
import { scratchAppHostName } from "@/utilities/constants";
import { TaskType } from "@/api/collimator/generated/models";
import TaskModal from "./TaskModal";
import { useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import { useSolutionFile } from "@/api/collimator/hooks/solutions/useSolution";
import MultiSwrContent from "../MultiSwrContent";
import { EmbeddedAppRef } from "../EmbeddedApp";
import { Language } from "@/types/app-iframe-message/languages";

const getViewUrl = (taskType: TaskType) => {
  switch (taskType) {
    case TaskType.SCRATCH:
      return `${scratchAppHostName}/edit`;
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
  taskType,
  solutionId,
  header,
  footer,
}: {
  isShown: boolean;
  setIsShown: (isShown: boolean) => void;
  classId: number;
  sessionId: number;
  taskId: number;
  taskType: TaskType;
  solutionId: number;
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
  } = useSolutionFile(classId, sessionId, taskId, solutionId);

  const loadContent = useCallback(
    (embeddedApp: EmbeddedAppRef) => {
      if (taskFile && solutionFile) {
        embeddedApp.sendRequest({
          procedure: "loadSubmission",
          arguments: {
            task: taskFile,
            submission: solutionFile,
            language: intl.locale as Language,
          },
        });
      }
    },
    [taskFile, solutionFile, intl],
  );

  if (!isShown) {
    return false;
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
