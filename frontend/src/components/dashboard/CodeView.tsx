import { FormattedMessage, useIntl } from "react-intl";
import { useCallback, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { Language } from "iframe-rpc-react/src";
import { LuExpand } from "react-icons/lu";
import { TaskType } from "@/api/collimator/generated/models";
import { jupyterAppHostName, scratchAppHostName } from "@/utilities/constants";
import { useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import { useSolutionFile } from "@/api/collimator/hooks/solutions/useSolution";
import { useFileHash } from "@/hooks/useFileHash";
import { executeWithToasts } from "@/utilities/task/task";
import { messages as taskMessages } from "@/i18n/task-messages";
import Button from "../Button";
import ViewSolutionModal from "../modals/ViewSolutionModal";
import MultiSwrContent from "../MultiSwrContent";
import EmbeddedApp, { EmbeddedAppRef } from "../EmbeddedApp";

export const CodeViewContainer = styled.div`
  /* always take up 100% of the screen (minus some margin for the selects and axis values) */
  height: calc(100vh - 6rem);

  border: var(--foreground-color) 1px solid;
  border-radius: var(--border-radius);

  display: flex;
  justify-content: center;
  align-items: center;
`;

const CodeViewWrapper = styled(CodeViewContainer)`
  position: relative;

  > div,
  > div > iframe {
    height: 100% !important;
  }
`;

const getSolutionCodeUrl = (taskType: TaskType) => {
  switch (taskType) {
    case TaskType.SCRATCH:
      return `${scratchAppHostName}/show`;
    case TaskType.JUPYTER:
      return `${jupyterAppHostName}?mode=show`;
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
  solutionHash,
  modalFooter,
}: {
  classId: number;
  sessionId: number;
  taskId: number;
  subTaskId?: string;
  taskType: TaskType;
  solutionHash: string;
  modalFooter?: React.ReactNode;
}) => {
  const intl = useIntl();
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const iframeSrc = useMemo(() => getSolutionCodeUrl(taskType), [taskType]);

  const taskFileHash = useFileHash(taskFile);
  const solutionFileHash = useFileHash(solutionFile);

  const embeddedApp = useRef<EmbeddedAppRef | null>(null);

  const onAppAvailable = useCallback(() => {
    if (embeddedApp.current && taskFile && solutionFile) {
      executeWithToasts(
        () =>
          embeddedApp.current!.sendRequest("loadSubmission", {
            task: taskFile,
            submission: solutionFile,
            subTaskId: subTaskId,
            language: intl.locale as Language,
          }),
        intl.formatMessage(taskMessages.submissionLoaded),
        intl.formatMessage(taskMessages.cannotLoadSubmission),
      );
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
    <>
      <CodeViewWrapper>
        <MultiSwrContent
          data={[taskFile, solutionFile]}
          isLoading={[isLoadingTaskFile, isLoadingSolutionFile]}
          errors={[taskFileError, solutionFileError]}
        >
          {() => (
            <>
              <Button
                position="absolute"
                top="sm"
                right="sm"
                zIndex="overlay"
                opacity={{ base: 0.5, _hover: 1 }}
                onClick={() => setIsFullscreen(true)}
              >
                <LuExpand />
              </Button>
              <EmbeddedApp
                src={iframeSrc}
                ref={embeddedApp}
                onAppAvailable={onAppAvailable}
              />
            </>
          )}
        </MultiSwrContent>
      </CodeViewWrapper>
      {isFullscreen && (
        <ViewSolutionModal
          isShown={isFullscreen}
          setIsShown={setIsFullscreen}
          classId={classId}
          sessionId={sessionId}
          taskId={taskId}
          taskType={taskType}
          solutionHash={solutionHash}
          footer={modalFooter}
        />
      )}
    </>
  );
};

export default CodeView;
