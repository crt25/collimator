import EmbeddedApp, { EmbeddedAppRef } from "@/components/EmbeddedApp";
import TaskDescription from "@/components/TaskDescription";
import styled from "@emotion/styled";
import { MutableRefObject } from "react";
import { CloseButton, Col, Container, Row } from "react-bootstrap";
import TaskList from "./TaskList";
import TaskListItem from "./TaskListItem";
import { TaskStatus } from "@/types/task/task-status";

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
`;

const SessionMenuWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const SessionMenuInner = styled(Container)`
  flex-grow: 1;

  /* by default flex items cannot be smaller than their contents, override this, see https://stackoverflow.com/a/43809765/2897827 */
  min-height: 0;

  display: flex;
  flex-direction: column;
`;

const SessionMenuRow = styled(Row)`
  min-height: 0;

  & > * {
    height: 100%;
  }
`;

const CloseSessionMenuButton = styled(CloseButton)`
  position: absolute;
  top: 1rem;
  left: 1rem;

  padding: 1rem;
`;

export interface TaskRef {
  showTaskMenu: boolean;
  setShowTaskMenu: (show: boolean) => void;
}

interface Props {
  sessionName: string;
  showSessionMenu: boolean;
  setShowSessionMenu: (show: boolean) => void;
  iFrameSrc: string;
  embeddedApp: MutableRefObject<EmbeddedAppRef | null>;
}

const Task = ({
  sessionName,
  showSessionMenu: showTaskMenu,
  setShowSessionMenu: setShowTaskMenu,
  iFrameSrc,
  embeddedApp,
}: Props) => (
  <TaskWrapper>
    {showTaskMenu && (
      <SessionMenu>
        <SessionMenuWrapper>
          <CloseSessionMenuButton onClick={() => setShowTaskMenu(false)} />
          <SessionMenuInner>
            <h1 data-testid="session-name">{sessionName}</h1>
            <SessionMenuRow>
              <Col xs={4}>
                <TaskList>
                  <TaskListItem status={TaskStatus.done}>Task 1</TaskListItem>
                  <TaskListItem status={TaskStatus.partiallyDone}>
                    Task 2
                  </TaskListItem>
                  <TaskListItem status={TaskStatus.opened}>Task 3</TaskListItem>
                  <TaskListItem status={TaskStatus.unOpened}>
                    Task 4
                  </TaskListItem>
                  <TaskListItem status={TaskStatus.unOpened}>
                    Task 5
                  </TaskListItem>
                  <TaskListItem status={TaskStatus.opened}>
                    Task 6 with a very very very very very very very very very
                    very very very very very very long title
                  </TaskListItem>
                  <TaskListItem status={TaskStatus.unOpened}>
                    Task 5
                  </TaskListItem>
                  <TaskListItem status={TaskStatus.unOpened}>
                    Task 5
                  </TaskListItem>
                  <TaskListItem status={TaskStatus.unOpened}>
                    Task 5
                  </TaskListItem>
                  <TaskListItem status={TaskStatus.unOpened}>
                    Task 5
                  </TaskListItem>
                  <TaskListItem status={TaskStatus.unOpened}>
                    Task 5
                  </TaskListItem>
                  <TaskListItem status={TaskStatus.unOpened}>
                    Task 5
                  </TaskListItem>
                  <TaskListItem status={TaskStatus.unOpened}>
                    Task 5
                  </TaskListItem>
                  <TaskListItem status={TaskStatus.unOpened}>
                    Task 5
                  </TaskListItem>
                </TaskList>
              </Col>
              <Col xs={8}>
                <TaskDescription>
                  <p>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                    diam nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem
                    ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                    nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit amet.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                    diam nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem
                    ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                    nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit amet.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                    diam nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem
                    ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                    nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit amet.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                    diam nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem
                    ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
                    nonumy eirmod tempor invidunt ut labore et dolore magna
                    aliquyam erat, sed diam voluptua. At vero eos et accusam et
                    justo duo dolores et ea rebum. Stet clita kasd gubergren, no
                    sea takimata sanctus est Lorem ipsum dolor sit ametx.
                  </p>
                </TaskDescription>
              </Col>
            </SessionMenuRow>
          </SessionMenuInner>
        </SessionMenuWrapper>
      </SessionMenu>
    )}
    <EmbeddedApp src={iFrameSrc} ref={embeddedApp} />
  </TaskWrapper>
);

export default Task;
