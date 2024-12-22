import EmbeddedApp, { EmbeddedAppRef } from "../EmbeddedApp";
import { FormattedMessage, useIntl } from "react-intl";
import { useCallback, useMemo, useRef } from "react";
import { TaskType } from "@/api/collimator/generated/models";
import { scratchAppHostName } from "@/utilities/constants";
import { useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import { useSolutionFile } from "@/api/collimator/hooks/solutions/useSolution";
import MultiSwrContent from "../MultiSwrContent";
import { useFileHash } from "@/hooks/useFileHash";
import { Language } from "@/types/app-iframe-message/languages";
import styled from "@emotion/styled";

const CodeViewWrapper = styled.div`
  position: relative;
  /* always take up 100% of the screen */
  height: 100vh;

  border: var(--foreground-color) 1px solid;
  border-radius: var(--border-radius);

  > *,
  > * > iframe {
    height: 100%;
  }
`;

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
  subTaskId,
  taskType,
  solutionId,
}: {
  classId: number;
  sessionId: number;
  taskId: number;
  subTaskId?: string;
  taskType: TaskType;
  solutionId: number;
}) => {
  const intl = useIntl();

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

  const taskFileHash = useFileHash(taskFile);
  const solutionFileHash = useFileHash(solutionFile);

  const embeddedApp = useRef<EmbeddedAppRef | null>(null);

  const onAppAvailable = useCallback(() => {
    if (embeddedApp.current && taskFile && solutionFile) {
      embeddedApp.current.sendRequest({
        procedure: "loadSubmission",
        arguments: {
          task: taskFile,
          submission: solutionFile,
          subTaskId: subTaskId,
          language: intl.locale as Language,
        },
      });
    }
    // since solutionFileHash is a blob, use its hash as a proxy for its content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskFileHash, solutionFileHash, subTaskId, intl.locale]);

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
    <CodeViewWrapper>
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
    </CodeViewWrapper>
  );
};

export default CodeView;
