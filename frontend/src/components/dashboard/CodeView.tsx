import EmbeddedApp, { EmbeddedAppRef } from "../EmbeddedApp";
import { FormattedMessage } from "react-intl";
import { useCallback, useMemo, useRef } from "react";
import { TaskType } from "@/api/collimator/generated/models";
import { scratchAppHostName } from "@/utilities/constants";
import { useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import { useSolutionFile } from "@/api/collimator/hooks/solutions/useSolution";
import MultiSwrContent from "../MultiSwrContent";

const getSolutionCodeUrl = (taskType: TaskType) => {
  switch (taskType) {
    case TaskType.SCRATCH:
      return `${scratchAppHostName}/show`;
    default:
      return null;
  }
};

const CodeView = ({
  classId,
  sessionId,
  taskId,
  taskType,
  solutionId,
}: {
  classId: number;
  sessionId: number;
  taskId: number;
  taskType: TaskType;
  solutionId: number;
}) => {
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

  const iframeSrc = useMemo(() => getSolutionCodeUrl(taskType), [taskType]);

  const embeddedApp = useRef<EmbeddedAppRef | null>(null);

  const onAppAvailable = useCallback(() => {
    if (embeddedApp.current && taskFile && solutionFile) {
      embeddedApp.current.sendRequest({
        procedure: "loadSubmission",
        arguments: {
          task: taskFile,
          submission: solutionFile,
        },
      });
    }
  }, [taskFile, solutionFile]);

  if (!iframeSrc) {
    return (
      <FormattedMessage
        id="CodeView.unsupportedApp"
        defaultMessage="The unsupported application type {type} was selected (Task id {taskId}). Please report this issue."
        values={{ type: taskType, taskId: taskId }}
      />
    );
  }

  return (
    <MultiSwrContent
      data={[taskFile, solutionFile]}
      isLoading={[isLoadingTaskFile, isLoadingSolutionFile]}
      errors={[taskFileError, solutionFileError]}
    >
      {() => (
        <EmbeddedApp
          src={iframeSrc}
          ref={embeddedApp}
          onAppAvailable={onAppAvailable}
        />
      )}
    </MultiSwrContent>
  );
};

export default CodeView;
