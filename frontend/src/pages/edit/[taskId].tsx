import Button from "@/components/Button";
import EmbeddedApp, { EmbeddedAppRef } from "@/components/EmbeddedApp";
import Header from "@/components/Header";
import { scratchAppHostName } from "@/utilities/constants";
import { downloadBlob } from "@/utilities/download";
import { readSingleFileFromDisk } from "@/utilities/file-from-disk";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useCallback, useMemo, useRef } from "react";

const SolveContainer = styled.div`
  height: 100vh;

  display: flex;
  flex-direction: column;
`;

const EditTask = () => {
  const router = useRouter();
  const { taskId } = router.query as {
    taskId: string;
  };

  const iFrameSrc = useMemo(() => {
    return `${scratchAppHostName}/edit/${taskId}`;
  }, [taskId]);

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

  return (
    <SolveContainer>
      <Header>
        <li>
          <Button onClick={onLoadTask}>Load Task</Button>
        </li>
        <li>
          <Button onClick={onSaveTask}>Save Task</Button>
        </li>
      </Header>
      <EmbeddedApp src={iFrameSrc} ref={embeddedApp} />
    </SolveContainer>
  );
};

export default EditTask;
