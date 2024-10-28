import Button from "@/components/Button";
import EmbeddedApp, { EmbeddedAppRef } from "@/components/EmbeddedApp";
import Header from "@/components/Header";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import { scratchAppHostName } from "@/utilities/constants";
import { downloadBlob } from "@/utilities/download";
import { readSingleFileFromDisk } from "@/utilities/file-from-disk";
import { useRouter } from "next/router";
import { useCallback, useMemo, useRef } from "react";

const EditTask = () => {
  const router = useRouter();
  const { taskId } = router.query as {
    taskId?: string;
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
    <MaxScreenHeight>
      <Header>
        <li>
          <Button onClick={onLoadTask} data-testid="load-task-button">
            Load Task
          </Button>
        </li>
        <li>
          <Button onClick={onSaveTask} data-testid="save-task-button">
            Save Task
          </Button>
        </li>
      </Header>
      <EmbeddedApp src={iFrameSrc} ref={embeddedApp} />
    </MaxScreenHeight>
  );
};

export default EditTask;
