import EmbeddedApp, { EmbeddedAppRef } from "@/components/EmbeddedApp";
import { scratchAppHostName } from "@/utilities/constants";
import { downloadBlob } from "@/utilities/download";
import { readSingleFileFromDisk } from "@/utilities/file-from-disk";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useCallback, useMemo, useRef } from "react";
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

  const onLoadTask = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    // TODO: get the task from the API
    // for now get it from the file system

    const task = await readSingleFileFromDisk();

    await embeddedApp.current.sendRequest({
      procedure: "loadTask",
      // typescript does not seem to notice that "arguments" is required but without the Omit<> it does, a bug?
      arguments: task,
    });
  }, []);

  const onSaveTask = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    const response = await embeddedApp.current.sendRequest({
      procedure: "getTask",
    });

    // TODO: Save submission

    // for now, just download the file
    downloadBlob(response.result, "task.zip");
  }, []);

  const onSubmitSolution = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    const response = await embeddedApp.current.sendRequest({
      procedure: "getSubmission",
    });

    // TODO: Save submission

    // for now, just log the result
    const result = response.result;
    if (result.type === "application/json") {
      const json = await result.text();
      console.log(json);
    } else {
      console.log("result", result);
    }
  }, []);

  return (
    <SolveContainer>
      <Container>
        <Row>
          <Col xs={12}>
            <div onClick={onLoadTask}>Load Task</div>
            <div onClick={onSaveTask}>Save Task</div>
            <div onClick={onSubmitSolution}>Submit Task</div>
          </Col>
        </Row>
      </Container>
      <EmbeddedApp src={iFrameSrc} ref={embeddedApp} />
    </SolveContainer>
  );
};

export default SolveTask;
