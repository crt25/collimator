import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Language, Submission, Test, ToastType } from "iframe-rpc-react/src";
import { Alert, Box, Breadcrumb, Text } from "@chakra-ui/react";
import { LuListTodo, LuSignpost } from "react-icons/lu";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { useCreateSolution } from "@/api/collimator/hooks/solutions/useCreateSolution";
import { useTask, useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import Button from "@/components/Button";
import { EmbeddedAppRef } from "@/components/EmbeddedApp";
import StudentPageLayout from "@/components/layout/StudentPageLayout";
import MultiSwrContent from "@/components/MultiSwrContent";
import Task from "@/components/Task";
import { getEmbeddedAppUrl } from "@/utilities/embedded-app-url";
import { downloadBlob } from "@/utilities/download";
import { readSingleFileFromDisk } from "@/utilities/file-from-disk";
import { useFileHash } from "@/hooks/useFileHash";
import { useFetchLatestSolutionFile } from "@/api/collimator/hooks/solutions/useSolution";
import Breadcrumbs from "@/components/Breadcrumbs";
import BreadcrumbItem from "@/components/BreadcrumbItem";
import { toastDuration, toaster } from "@/components/Toaster";
import { executeAsyncWithToasts } from "@/utilities/task";
import { messages as taskMessages } from "@/i18n/task-messages";

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

  // do not revalidate the task and task file while solving to prevent app reloads
  const noTaskRevalidation = useMemo(
    () => ({
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }),
    [],
  );

  const {
    data: task,
    error: taskError,
    isLoading: isLoadingTask,
  } = useTask(taskId, noTaskRevalidation);

  const {
    data: taskFile,
    error: taskFileError,
    isLoading: isLoadingTaskFile,
  } = useTaskFile(taskId, noTaskRevalidation);

  const fetchLatestSolutionFile = useFetchLatestSolutionFile();

  const createSolution = useCreateSolution();

  const taskFileHash = useFileHash(taskFile);

  const iframeSrc = useMemo(
    () => (task?.type ? getEmbeddedAppUrl(task.type, "solve") : null),
    [task?.type],
  );

  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const embeddedApp = useRef<EmbeddedAppRef | null>(null);
  const wasInitialized = useRef(false);
  const isScratchMutexAvailable = useRef(true);
  // The freshest solution the embedded app has pushed up (e.g. the auto-save
  // triggered right before a language change reloads the iframe). The parent
  // frame is not reloaded, so this ref survives; we replay it after the reload
  // instead of racing the still-in-flight backend write with a stale fetch,
  // which otherwise loses the student's unsaved changes (CRT-397). Keyed by
  // task id: this page component survives task-to-task navigation (dynamic
  // route params do not remount it), so an unconsumed stash must never be
  // replayed into a different task.
  const pendingSolution = useRef<{ taskId: number; solution: Blob } | null>(
    null,
  );

  // Latest-ref mirror of intl so that onAppAvailable's identity does not
  // rotate on locale changes: useIframeChild eagerly re-invokes a rotated
  // onAppAvailable against the still-loaded old iframe, which would consume
  // the stash above right before the locale-triggered reload discards the
  // result (the same reason task/taskFile revalidation is disabled).
  const intlRef = useRef(intl);
  useEffect(() => {
    intlRef.current = intl;
  });

  const toggleSessionMenu = useCallback(() => {
    setShowSessionMenu((show) => !show);
  }, []);

  const [saveError, setSaveError] = useState(false);

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
          id: `correct-solution-submitted-${Date.now()}`,
          title: intl.formatMessage(messages.correctSolutionSubmitted),
          action: {
            label: intl.formatMessage(messages.openTaskList),
            onClick: () => setShowSessionMenu(true),
          },
          closable: true,
          duration: toastDuration,
        });
      } else {
        toaster.info({
          id: `solution-submitted-${Date.now()}`,
          title: intl.formatMessage(messages.solutionSubmitted),
          action: {
            label: intl.formatMessage(messages.openTaskList),
            onClick: () => setShowSessionMenu(true),
          },
          closable: true,
          duration: toastDuration,
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

    try {
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

      setSaveError(false);
    } catch (error) {
      console.error("Failed to submit solution with", error);
      setSaveError(true);
    } finally {
      isScratchMutexAvailable.current = true;
    }
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

      const intl = intlRef.current;

      // Prefer a solution stashed just before a reload (it includes changes
      // that may not have reached the backend yet); otherwise load the latest
      // persisted solution. Consume the stash synchronously so a solution
      // arriving while the load below is in flight is not clobbered, and only
      // accept it for the task it was stashed for.
      const stashed = pendingSolution.current;
      pendingSolution.current = null;
      const stashedSolution =
        stashed?.taskId === task.id ? stashed.solution : null;

      try {
        const solutionFile =
          stashedSolution ??
          (await fetchLatestSolutionFile(
            session.klass.id,
            session.id,
            task.id,
          ));

        isScratchMutexAvailable.current = false;

        await executeAsyncWithToasts(
          () =>
            embeddedApp.current!.sendRequest("loadSubmission", {
              task: taskFile,
              submission: solutionFile,
              language: intl.locale as Language,
            }),
          { intl, descriptor: taskMessages.cannotLoadSubmission },
        );
      } catch {
        // Put the stash back (unless something newer arrived meanwhile) so the
        // next app load can still restore it — it may hold work that never
        // reached the backend. A stash for a different task is dropped instead.
        // A failed replay does not mean the stashed copy is bad (the embedded
        // app may still be initializing after a locale change), so we must NOT
        // fall back to the pristine task in that case — it would visibly
        // discard the stashed work; the next app load replays the stash.
        if (stashedSolution !== null) {
          pendingSolution.current ??= stashed;
          return;
        }

        // if we cannot fetch the latest solution file we load the task from scratch
        await embeddedApp.current.sendRequest("loadTask", {
          task: taskFile,
          language: intl.locale as Language,
        });
      } finally {
        isScratchMutexAvailable.current = true;
      }
    }
    // since taskFile is a blob, use its hash as a proxy for its content.
    // intl is intentionally read through intlRef (not listed as a dep): see the
    // comment on intlRef — a locale change must not rotate this callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embeddedApp, taskFileHash, session, task]);

  const onReceiveTaskSolution = useCallback(
    async (solutionBlob: Blob) => {
      if (!session || !task) {
        console.error("No session or task available");
        return;
      }

      // Stash synchronously so a reload can replay it even if the backend write
      // below is still in flight (CRT-397). Keyed by task id so it can never be
      // replayed into a different task.
      pendingSolution.current = { taskId: task.id, solution: solutionBlob };

      try {
        await createSolution(session.klass.id, session.id, task.id, {
          file: solutionBlob,
          tests: [],
        });
        setSaveError(false);
      } catch (error) {
        console.error("Failed to receive task solution with", error);
        setSaveError(true);
      }
    },
    [session, task, createSolution],
  );

  const onReceiveMessage = useCallback(
    (title: string, message: string, type: ToastType) => {
      if (!title && !message) {
        return;
      }

      toaster.create({
        title,
        description: message,
        type,
        duration: toastDuration,
        closable: true,
      });
    },
    [],
  );

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

    await executeAsyncWithToasts(
      () =>
        embeddedApp.current!.sendRequest("importTask", {
          task,
          language: intl.locale as Language,
        }),
      { intl, descriptor: taskMessages.cannotImportTask },
    );
  }, [intl]);

  const onExport = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    const response = await executeAsyncWithToasts(
      () => embeddedApp.current!.sendRequest("exportTask", undefined),
      { intl, descriptor: taskMessages.cannotExport },
      intl.formatMessage(taskMessages.taskCreated),
    );

    downloadBlob(response.result.file, response.result.filename);
  }, [intl]);

  if (!sessionId || !taskId) {
    return null;
  }

  // FEATURE FLAG: Disable import/export for now
  const disableImportExport = true;

  return (
    <StudentPageLayout
      title={messages.title}
      titleParameters={{ title: task?.title ?? "" }}
      logo={
        task &&
        session && (
          <Box>
            <Breadcrumbs
              topLevel={
                <BreadcrumbItem
                  onClick={toggleSessionMenu}
                  icon={<LuSignpost />}
                  testId="toggle-session-menu-button"
                >
                  {session.title}
                </BreadcrumbItem>
              }
              marginBottom="0"
            >
              <Breadcrumb.Separator />
              <BreadcrumbItem icon={<LuListTodo />} onClick={toggleSessionMenu}>
                {task.title}
              </BreadcrumbItem>
            </Breadcrumbs>
          </Box>
        )
      }
      headerActions={
        <>
          <li></li>

          {saveError && (
            <Alert.Root
              status="error"
              data-testid="save-error-message"
              size="sm"
            >
              <Alert.Indicator />
              <Alert.Title>
                <FormattedMessage
                  data-testid="save-error-message"
                  id="SolveTask.saveError"
                  defaultMessage="You are currently experiencing network issues, saving may not work."
                />
              </Alert.Title>
            </Alert.Root>
          )}
          {!disableImportExport && (
            <>
              <li>
                <Button onClick={onExport} variant="subtle">
                  <FormattedMessage
                    id="SolveTask.export"
                    defaultMessage="Export"
                  />
                </Button>
              </li>
              <li>
                <Button onClick={onImport} variant="subtle">
                  <FormattedMessage
                    id="SolveTask.import"
                    defaultMessage="Import"
                  />
                </Button>
              </li>
            </>
          )}
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
        </>
      }
      belowHeader={
        task && (
          <Text marginBottom="md" marginX="lg">
            {task.description}
          </Text>
        )
      }
    >
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
              onReceiveTaskSolution={onReceiveTaskSolution}
              onTrackStudentActivityFailure={setSaveError}
              onReceiveMessage={onReceiveMessage}
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
    </StudentPageLayout>
  );
};

export default SolveTaskPage;
