import EmbeddedApp, { EmbeddedAppRef } from "@/components/EmbeddedApp";
import TaskDescription from "@/components/TaskDescription";
import styled from "@emotion/styled";
import { MutableRefObject } from "react";
import { CloseButton, Col } from "react-bootstrap";
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
  sessionId: number;
  sessionName: string;
  showSessionMenu: boolean;
  setShowSessionMenu: (show: boolean) => void;
  iframeSrc: string;
  embeddedApp: MutableRefObject<EmbeddedAppRef | null>;
}

const Task = ({
  sessionId,
  sessionName,
  showSessionMenu: showTaskMenu,
  setShowSessionMenu: setShowTaskMenu,
  iframeSrc,
  embeddedApp,
}: Props) => (
  <TaskWrapper>
    {showTaskMenu && (
      <SessionMenu>
        <SessionMenuWrapper>
          <CloseSessionMenuButton onClick={() => setShowTaskMenu(false)} />
          <RemainingHeightContainer>
            <h1 data-testid="session-name">{sessionName}</h1>
            <FullHeightRow>
              <Col xs={4}>
                <TaskList sessionId={sessionId} />
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
            </FullHeightRow>
            <VerticalSpacing />
          </RemainingHeightContainer>
        </SessionMenuWrapper>
      </SessionMenu>
    )}
    <EmbeddedApp src={iframeSrc} ref={embeddedApp} />
  </TaskWrapper>
);

export default Task;
