import { RefObject, useCallback } from "react";
import { Col } from "react-bootstrap";
import { CloseButton, chakra } from "@chakra-ui/react";
import { Submission } from "iframe-rpc-react/src";
import EmbeddedApp, { EmbeddedAppRef } from "@/components/EmbeddedApp";
import TaskDescription from "@/components/TaskDescription";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import { useTrackStudentActivity } from "@/api/collimator/hooks/student-activity/useTrackStudentActivity";
import { StudentActivityType } from "@/api/collimator/generated/models";
import VerticalSpacing from "./layout/VerticalSpacing";
import FullHeightRow from "./layout/FullHeightRow";
import RemainingHeightContainer from "./layout/RemainingHeightContainer";
import TaskList from "./TaskList";

const TaskWrapper = chakra("div", {
  base: {
    flexGrow: 1,
    position: "relative",
    display: "flex",
  },
});

const SessionMenu = chakra("div", {
  base: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "bg",
    opacity: 0.9,
    overflow: "hidden",
    paddingTop: "sm",
    zIndex: 1000,
  },
});

const SessionMenuWrapper = chakra("div", {
  base: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
});

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

  const onStudentAppActivity = useCallback(
    (action: string, data: Record<string, unknown>, solution: Blob) => {
      trackStudentActivity({
        type: StudentActivityType.TASK_APP_ACTIVITY,
        sessionId: session.id,
        taskId: task.id,
        appActivity: {
          type: action,
          data,
        },
        solution,
      });
    },
    [trackStudentActivity, session.id, task.id],
  );

  return (
    <TaskWrapper>
      {showSessionMenu && (
        <SessionMenu>
          <SessionMenuWrapper>
            <CloseButton onClick={() => setShowSessionMenu(false)} />
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
        onStudentAppActivity={onStudentAppActivity}
      />
    </TaskWrapper>
  );
};

export default Task;
