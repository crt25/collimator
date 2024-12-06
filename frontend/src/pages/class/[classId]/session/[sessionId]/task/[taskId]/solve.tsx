import { TaskType } from "@/api/collimator/generated/models";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { useCreateSolution } from "@/api/collimator/hooks/solutions/useCreateSolution";
import { useTask, useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import Button from "@/components/Button";
import { EmbeddedAppRef } from "@/components/EmbeddedApp";
import Header from "@/components/Header";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import MultiSwrContent from "@/components/MultiSwrContent";
import Task from "@/components/Task";
import { scratchAppHostName } from "@/utilities/constants";
import { downloadBlob } from "@/utilities/download";
import { readSingleFileFromDisk } from "@/utilities/file-from-disk";
import { useRouter } from "next/router";
import { useCallback, useMemo, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";

const getSolveUrl = (taskType: TaskType) => {
  switch (taskType) {
    case TaskType.SCRATCH:
      return `${scratchAppHostName}/solve`;
    default:
      return null;
  }
};

const SolveTaskPage = () => {
  const router = useRouter();
  const { classId, sessionId, taskId } = router.query as {
    classId?: string;
    sessionId?: string;
    taskId?: string;
  };

  const {
    data: session,
    error: sessionError,
    isLoading: isLoadingSession,
  } = useClassSession(classId, sessionId);

  const {
    data: task,
    error: taskError,
    isLoading: isLoadingTask,
  } = useTask(taskId);

  const {
    data: taskFile,
    error: taskFileError,
    isLoading: isLoadingTaskFile,
  } = useTaskFile(taskId);

  const createSolution = useCreateSolution();

  const iframeSrc = useMemo(
    () => (task ? getSolveUrl(task.type) : null),
    [task],
  );

  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const embeddedApp = useRef<EmbeddedAppRef | null>(null);

  const onSubmitSolution = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    if (!session || !task || !taskFile) {
      return;
    }

    const response = await embeddedApp.current.sendRequest({
      procedure: "getSubmission",
    });

    await createSolution(session.klass.id, session.id, task.id, {
      file: response.result.file,
      totalTests: response.result.totalTests,
      passedTests: response.result.passedTests,
    });
  }, [session, task, taskFile, createSolution]);

  const toggleSessionMenu = useCallback(() => {
    setShowSessionMenu((show) => !show);
  }, []);

  const onAppAvailable = useCallback(() => {
    if (embeddedApp.current && taskFile) {
      embeddedApp.current.sendRequest({
        procedure: "loadTask",
        arguments: taskFile,
      });
    }
  }, [taskFile]);

  const onImport = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    const task = await readSingleFileFromDisk();

    await embeddedApp.current.sendRequest({
      procedure: "loadTask",
      arguments: task,
    });
  }, []);

  const onExport = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    const response = await embeddedApp.current.sendRequest({
      procedure: "getTask",
    });

    downloadBlob(response.result, "task.sb3");
  }, []);

  if (!sessionId || !taskId) {
    return null;
  }

  return (
    <MaxScreenHeight>
      <Header>
        <li>
          <Button
            onClick={toggleSessionMenu}
            data-testid="toggle-session-menu-button"
          >
            {showSessionMenu ? (
              <span>
                <FormattedMessage
                  id="SolveTask.getStarted"
                  defaultMessage="Hide Session"
                />
              </span>
            ) : (
              <span>
                <FormattedMessage
                  id="SolveTask.getStarted"
                  defaultMessage="Show Session"
                />
              </span>
            )}
          </Button>
        </li>
        <li>
          <Button
            onClick={onSubmitSolution}
            data-testid="submit-solution-button"
          >
            <FormattedMessage
              id="SolveTask.getStarted"
              defaultMessage="Submit Solution"
            />
          </Button>
        </li>
        <li>
          <Button onClick={onExport}>
            <FormattedMessage id="SolveTask.export" defaultMessage="Export" />
          </Button>
        </li>
        <li>
          <Button onClick={onImport}>
            <FormattedMessage id="SolveTask.import" defaultMessage="Import" />
          </Button>
        </li>
      </Header>
      <MultiSwrContent
        data={[session, task, taskFile]}
        errors={[sessionError, taskError, taskFileError]}
        isLoading={[isLoadingSession, isLoadingTask, isLoadingTaskFile]}
      >
        {([session, task, _taskFile]) =>
          iframeSrc ? (
            <Task
              classId={session.klass.id}
              session={session}
              task={task}
              showSessionMenu={showSessionMenu}
              setShowSessionMenu={setShowSessionMenu}
              embeddedApp={embeddedApp}
              iframeSrc={iframeSrc}
              onAppAvailable={onAppAvailable}
            />
          ) : (
            <FormattedMessage
              id="SolveTask.unsupportedApp"
              defaultMessage="The unsupported application type {type} was selected (Task id {taskId}). Please report this issue."
              values={{ type: task.type, taskId: task.id }}
            />
          )
        }
      </MultiSwrContent>
    </MaxScreenHeight>
  );
};

export default SolveTaskPage;
