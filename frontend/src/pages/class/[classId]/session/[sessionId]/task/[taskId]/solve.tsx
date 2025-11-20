import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Language, Submission, Test } from "iframe-rpc-react/src";
import { Box, Breadcrumb, Text } from "@chakra-ui/react";
import { LuListTodo, LuSignpost } from "react-icons/lu";
import { TaskType } from "@/api/collimator/generated/models";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { useCreateSolution } from "@/api/collimator/hooks/solutions/useCreateSolution";
import { useTask, useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import Button from "@/components/Button";
import { EmbeddedAppRef } from "@/components/EmbeddedApp";
import StudentHeader from "@/components/header/StudentHeader";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import MultiSwrContent from "@/components/MultiSwrContent";
import Task from "@/components/Task";
import { jupyterAppHostName, scratchAppHostName } from "@/utilities/constants";
import { downloadBlob } from "@/utilities/download";
import { readSingleFileFromDisk } from "@/utilities/file-from-disk";
import { useFileHash } from "@/hooks/useFileHash";
import { useFetchLatestSolutionFile } from "@/api/collimator/hooks/solutions/useSolution";
import Breadcrumbs from "@/components/Breadcrumbs";
import BreadcrumbItem from "@/components/BreadcrumbItem";
import { toaster } from "@/components/Toaster";

const messages = defineMessages({
  title: {
    id: "SolveTaskPage.title",
    defaultMessage: "Solve - {title}",
  },
  correctSolutionSubmitted: {
    id: "SolveTask.correctSolutionSubmitted",
    defaultMessage:
      "Your successfully solved this task. You can check if there are more tasks in the lesson menu.",
  },
  solutionSubmitted: {
    id: "SolveTask.solutionSubmitted",
    defaultMessage: "The solution was submitted successfully.",
  },
  openTaskList: {
    id: "SolveTask.openTaskList",
    defaultMessage: "Open Task List",
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

  const toggleSessionMenu = useCallback(() => {
    setShowSessionMenu((show) => !show);
  }, []);

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
        toaster.success({
          title: intl.formatMessage(messages.correctSolutionSubmitted),
          action: {
            label: intl.formatMessage(messages.openTaskList),
            onClick: () => setShowSessionMenu(true),
          },
          closable: true,
          duration: 60 * 1000,
        });
      } else {
        toaster.info({
          title: intl.formatMessage(messages.solutionSubmitted),
          action: {
            label: intl.formatMessage(messages.openTaskList),
            onClick: () => setShowSessionMenu(true),
          },
          closable: true,
          duration: 60 * 1000,
        });
      }
    },
    [createSolution, intl, setShowSessionMenu],
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

  // FEATURE FLAG: Disable import/export for now
  const disableImportExport = true;

  return (
    <MaxScreenHeight>
      <StudentHeader
        title={messages.title}
        titleParameters={{ title: task?.title }}
        logo={
          task &&
          session && (
            <Box>
              <Breadcrumbs
                topLevel={
                  <BreadcrumbItem
                    onClick={toggleSessionMenu}
                    icon={<LuSignpost />}
                  >
                    {session.title}
                  </BreadcrumbItem>
                }
                marginBottom="0"
              >
                <Breadcrumb.Separator />
                <BreadcrumbItem
                  icon={<LuListTodo />}
                  onClick={toggleSessionMenu}
                >
                  {task.title}
                </BreadcrumbItem>
              </Breadcrumbs>
            </Box>
          )
        }
        belowHeader={task && <Text marginBottom="md">{task.description}</Text>}
      >
        <li></li>
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
        {!disableImportExport && (
          <>
            <li>
              <Button onClick={onExport}>
                <FormattedMessage
                  id="SolveTask.export"
                  defaultMessage="Export"
                />
              </Button>
            </li>
            <li>
              <Button onClick={onImport}>
                <FormattedMessage
                  id="SolveTask.import"
                  defaultMessage="Import"
                />
              </Button>
            </li>
          </>
        )}
      </StudentHeader>
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
