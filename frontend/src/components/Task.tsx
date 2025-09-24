import styled from "@emotion/styled";
import { RefObject, useCallback } from "react";
import { CloseButton, Col } from "react-bootstrap";
import { Submission } from "iframe-rpc-react/src";
import EmbeddedApp, { EmbeddedAppRef } from "@/components/EmbeddedApp";
import TaskDescription from "@/components/TaskDescription";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import { useTrackStudentActivity } from "@/api/collimator/hooks/student-activity/useTrackStudentActivity";
import { StudentActivityType } from "@/api/collimator/generated/models";
import TaskList from "./TaskList";
import RemainingHeightContainer from "./layout/RemainingHeightContainer";
import FullHeightRow from "./layout/FullHeightRow";
import VerticalSpacing from "./layout/VerticalSpacing";

const TaskWrapper = styled.div`
  flex-grow: 1;
  position: relative;

  display: flex;
`;

const SessionMenu = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  background-color: rgba(255, 255, 255, 0.9);

  overflow: hidden;

  padding-top: 1rem;

  z-index: 1000;
`;

const SessionMenuWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CloseSessionMenuButton = styled(CloseButton)`
  padding: 1rem;
`;

export interface TaskRef {
  showTaskMenu: boolean;
  setShowTaskMenu: (show: boolean) => void;
}

interface Props {
  session: ExistingSessionExtended;
  classId: number;
  task: ExistingTask;
  showSessionMenu: boolean;
  setShowSessionMenu: (show: boolean) => void;
  iframeSrc: string;
  embeddedApp: RefObject<EmbeddedAppRef | null>;
  onAppAvailable?: () => void;
  onReceiveSubmission?: (submission: Submission) => void;
}

const Task = ({
  classId,
  session,
  task,
  showSessionMenu,
  setShowSessionMenu,
  iframeSrc,
  embeddedApp,
  onAppAvailable,
  onReceiveSubmission,
}: Props) => {
  const trackStudentActivity = useTrackStudentActivity();
  const onSolutionRun = useCallback(
    (solution: Blob) => {
      trackStudentActivity({
        type: StudentActivityType.TASK_RUN_SOLUTION,
        sessionId: session.id,
        taskId: task.id,
        appActivity: null,
        solution,
      });
    },
    [trackStudentActivity, session.id, task.id],
  );

  const onStudentActivity = useCallback(
    (action: string, blockId: string) => {
      trackStudentActivity({
        type: StudentActivityType.TASK_APP_ACTIVITY,
        sessionId: session.id,
        taskId: task.id,
        appActivity: {
          type: "SCRATCH_BLOCK",
          data: `${action} block with id ${blockId}`,
        },
        solution: new Blob([], { type: "application/x.scratch.sb3" }), // dummy blob here, not used for user activity
      });
    },
    [trackStudentActivity, session.id, task.id],
  );

  return (
    <TaskWrapper>
      {showSessionMenu && (
        <SessionMenu>
          <SessionMenuWrapper>
            <CloseSessionMenuButton onClick={() => setShowSessionMenu(false)} />
            <RemainingHeightContainer>
              <h1 data-testid="session-name">{session.title}</h1>
              <FullHeightRow>
                <Col xs={4}>
                  <TaskList
                    classId={classId}
                    session={session}
                    currentTaskId={task.id}
                  />
                </Col>
                <Col xs={8}>
                  <TaskDescription>
                    <p>{task.description}</p>
                  </TaskDescription>
                </Col>
              </FullHeightRow>
              <VerticalSpacing />
            </RemainingHeightContainer>
          </SessionMenuWrapper>
        </SessionMenu>
      )}
      <EmbeddedApp
        src={iframeSrc}
        ref={embeddedApp}
        onAppAvailable={onAppAvailable}
        onReceiveSubmission={onReceiveSubmission}
        onSolutionRun={onSolutionRun}
        onStudentActivity={onStudentActivity}
      />
    </TaskWrapper>
  );
};

export default Task;
