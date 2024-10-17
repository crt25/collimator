import EmbeddedApp, { EmbeddedAppRef } from "@/components/EmbeddedApp";
import { scratchAppHostName } from "@/utilities/constants";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useMemo, useRef } from "react";
import { Col, Container, Row } from "react-bootstrap";

const SolveContainer = styled.div`
  height: 100vh;

  display: flex;
  flex-direction: column;
`;

const SolveTask = () => {
  const router = useRouter();
  const { sessionId, taskId } = router.query as {
    sessionId: string;
    taskId: string;
  };

  const iFrameSrc = useMemo(() => {
    return `${scratchAppHostName}/solve/${sessionId}/${taskId}`;
  }, [sessionId, taskId]);

  const embeddedApp = useRef<EmbeddedAppRef | null>(null);

  return (
    <SolveContainer>
      <Container>
        <Row>
          <Col xs={12}>
            <div
              onClick={() => {
                embeddedApp.current
                  ?.sendRequest({
                    procedure: "getSubmission",
                  })
                  .then((x) => {
                    console.log("xx", x.result);
                  });
              }}
            >
              Save
            </div>
          </Col>
        </Row>
      </Container>
      <EmbeddedApp src={iFrameSrc} ref={embeddedApp} />
    </SolveContainer>
  );
};

export default SolveTask;
