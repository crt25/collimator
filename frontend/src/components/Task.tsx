import EmbeddedApp, { EmbeddedAppRef } from "@/components/EmbeddedApp";
import TaskDescription from "@/components/TaskDescription";
import styled from "@emotion/styled";
import { MutableRefObject } from "react";
import { CloseButton, Col } from "react-bootstrap";
import TaskList from "./TaskList";
import RemainingHeightContainer from "./layout/RemainingHeightContainer";
import FullHeightRow from "./layout/FullHeightRow";
import VerticalSpacing from "./layout/VerticalSpacing";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";

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
  embeddedApp: MutableRefObject<EmbeddedAppRef | null>;
  onAppAvailable?: () => void;
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
}: Props) => (
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
    />
  </TaskWrapper>
);

export default Task;
