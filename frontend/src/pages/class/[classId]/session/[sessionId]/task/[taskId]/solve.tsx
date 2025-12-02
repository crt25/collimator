import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import toast from "react-hot-toast";
import { Language, Submission, Test } from "iframe-rpc-react/src";
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
import { jupyterAppHostName, scratchAppHostName } from "@/utilities/constants";
import { downloadBlob } from "@/utilities/download";
import { readSingleFileFromDisk } from "@/utilities/file-from-disk";
import { useFileHash } from "@/hooks/useFileHash";
import { useFetchLatestSolutionFile } from "@/api/collimator/hooks/solutions/useSolution";

const messages = defineMessages({
  title: {
    id: "SolveTaskPage.title",
    defaultMessage: "Solve - {title}",
  },
});

const getSolveUrl = (taskType: TaskType) => {
  switch (taskType) {
    case TaskType.SCRATCH:
      return `${scratchAppHostName}/solve`;
    case TaskType.JUPYTER:
      return `${jupyterAppHostName}?mode=solve`;
    default:
      return null;
  }
};

const SolveTaskPage = () => {
  const router = useRouter();
  const intl = useIntl();

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

  const fetchLatestSolutionFile = useFetchLatestSolutionFile();

  const createSolution = useCreateSolution();

  const taskFileHash = useFileHash(taskFile);

  const iframeSrc = useMemo(
    () => (task?.type ? getSolveUrl(task.type) : null),
    [task?.type],
  );

  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const embeddedApp = useRef<EmbeddedAppRef | null>(null);
  const wasInitialized = useRef(false);
  const isScratchMutexAvailable = useRef(true);

  const saveSubmission = useCallback(
    async (
      classId: number,
      sessionId: number,
      taskId: number,
      submission: Submission,
    ) => {
      const mapTest =
        (passed: boolean) =>
        ({ identifier, name, contextName }: Test) => ({
          identifier,
          name,
          contextName,
          passed,
        });

      await createSolution(classId, sessionId, taskId, {
        file: submission.file,
        tests: [
          ...submission.failedTests.map(mapTest(false)),
          ...submission.passedTests.map(mapTest(true)),
        ],
      });

      if (
        submission.failedTests.length === 0 &&
        submission.passedTests.length > 0
      ) {
        toast.success(
          <FormattedMessage
            id="SolveTask.correctSolutionSubmitted"
            defaultMessage="Your successfully solved this task. You can check if there are more tasks in the session menu."
          />,
        );
      } else {
        toast.success(
          <FormattedMessage
            id="SolveTask.solutionSubmitted"
            defaultMessage="The solution was submitted successfully."
          />,
        );
      }
    },
    [createSolution],
  );

  const onSubmitSolution = useCallback(async () => {
    if (!embeddedApp.current || !isScratchMutexAvailable.current) {
      return;
    }

    isScratchMutexAvailable.current = false;

    if (!session || !task) {
      return;
    }

    const response = await embeddedApp.current.sendRequest(
      "getSubmission",
      undefined,
    );

    await saveSubmission(
      session.klass.id,
      session.id,
      task.id,
      response.result,
    );

    isScratchMutexAvailable.current = true;
  }, [session, task, saveSubmission]);

  const toggleSessionMenu = useCallback(() => {
    setShowSessionMenu((show) => !show);
  }, []);

  useEffect(() => {
    if (embeddedApp.current && wasInitialized.current) {
      embeddedApp.current.sendRequest("setLocale", intl.locale as Language);
    }
  }, [intl.locale]);

  const onAppAvailable = useCallback(async () => {
    if (
      embeddedApp.current &&
      taskFile &&
      session &&
      task &&
      isScratchMutexAvailable.current
    ) {
      wasInitialized.current = true;

      try {
        const solutionFile = await fetchLatestSolutionFile(
          session.klass.id,
          session.id,
          task.id,
        );

        isScratchMutexAvailable.current = false;

        await embeddedApp.current.sendRequest("loadSubmission", {
          task: taskFile,
          submission: solutionFile,
          language: intl.locale as Language,
        });
      } catch {
        // if we cannot fetch the latest solution file we load the task from scratch
        await embeddedApp.current.sendRequest("loadTask", {
          task: taskFile,
          language: intl.locale as Language,
        });
      } finally {
        isScratchMutexAvailable.current = true;
      }
    }
    // since taskFile is a blob, use its hash as a proxy for its content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embeddedApp, taskFileHash, session, task]);

  const onReceiveSubmission = useCallback(
    async (submission: Submission) => {
      if (!session || !task) {
        return;
      }

      await saveSubmission(session.klass.id, session.id, task.id, submission);
    },
    [session, task, saveSubmission],
  );

  const onImport = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    const task = await readSingleFileFromDisk();

    await embeddedApp.current.sendRequest("loadTask", {
      task,
      language: intl.locale as Language,
    });
  }, [intl]);

  const onExport = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    const response = await embeddedApp.current.sendRequest(
      "getTask",
      undefined,
    );

    downloadBlob(response.result.file, "task.sb3");
  }, []);

  if (!sessionId || !taskId) {
    return null;
  }

  return (
    <MaxScreenHeight>
      <Header title={messages.title} titleParameters={{ title: task?.title }}>
        <li>
          <Button
            onClick={toggleSessionMenu}
            data-testid="toggle-session-menu-button"
          >
            {showSessionMenu ? (
              <span>
                <FormattedMessage
                  id="SolveTask.hideSession"
                  defaultMessage="Hide Session"
                />
              </span>
            ) : (
              <span>
                <FormattedMessage
                  id="SolveTask.showSession"
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
              id="SolveTask.submitSolution"
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
              onReceiveSubmission={onReceiveSubmission}
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
