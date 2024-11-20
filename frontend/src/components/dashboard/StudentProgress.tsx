import { useAllSessionSolutions } from "@/api/collimator/hooks/solutions/useAllSessionSolutions";
import SwrContent from "../SwrContent";
import { Accordion } from "react-bootstrap";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { SessionTask } from "@/api/collimator/models/sessions/session-task";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExistingSolution } from "@/api/collimator/models/solutions/existing-solution";
import { useSolutionFile } from "@/api/collimator/hooks/solutions/useSolution";
import { TaskType } from "@/api/collimator/generated/models";
import { scratchAppHostName } from "@/utilities/constants";
import MultiSwrContent from "../MultiSwrContent";
import { useTask, useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import EmbeddedApp, { EmbeddedAppRef } from "../EmbeddedApp";
import { FormattedMessage } from "react-intl";

type Progress = ExistingSolution;
type ProgressByTask = { [taskId: number]: Progress };

const getDisplaySolutionUrl = (taskType: TaskType) => {
  switch (taskType) {
    case TaskType.SCRATCH:
      return `${scratchAppHostName}/show`;
    default:
      return null;
  }
};

const UserTaskProgress = ({
  open,
  classId,
  sessionId,
  task: sessionTask,
  progress,
}: {
  open: boolean;
  classId: number;
  sessionId: number;
  task: SessionTask;
  progress: Progress;
}) => {
  const {
    data: task,
    isLoading: isLoadingTask,
    error: taskError,
  } = useTask(sessionTask.id);

  const {
    data: taskFile,
    isLoading: isLoadingTaskFile,
    error: taskFileError,
  } = useTaskFile(sessionTask.id);

  const {
    data: solutionFile,
    isLoading: isLoadingSolutionFile,
    error: solutionFileError,
  } = useSolutionFile(classId, sessionId, sessionTask.id, progress.id);

  const iframeSrc = useMemo(
    () => (task ? getDisplaySolutionUrl(task.type) : null),
    [task],
  );

  const embeddedApp = useRef<EmbeddedAppRef | null>(null);

  const onAppAvailable = useCallback(() => {
    if (embeddedApp.current && taskFile && solutionFile) {
      embeddedApp.current.sendRequest({
        procedure: "loadSubmission",
        arguments: {
          task: taskFile,
          submission: solutionFile,
        },
      });
    }
  }, [taskFile, solutionFile]);

  if (!iframeSrc) {
    return (
      <Accordion.Item key={sessionTask.id} eventKey={sessionTask.id.toString()}>
        <Accordion.Header>{sessionTask.title}</Accordion.Header>
        <Accordion.Body>
          <FormattedMessage
            id="UserTaskProgress.unsupportedApp"
            defaultMessage="An unsupported application type was selected. Please report this issue."
          />
        </Accordion.Body>
      </Accordion.Item>
    );
  }

  return (
    <Accordion.Item key={sessionTask.id} eventKey={sessionTask.id.toString()}>
      <Accordion.Header>{sessionTask.title}</Accordion.Header>
      <Accordion.Body>
        <MultiSwrContent
          data={[solutionFile, task, taskFile]}
          errors={[solutionFileError, taskError, taskFileError]}
          isLoading={[isLoadingSolutionFile, isLoadingTask, isLoadingTaskFile]}
        >
          {() =>
            open && (
              <EmbeddedApp
                src={iframeSrc}
                ref={embeddedApp}
                onAppAvailable={onAppAvailable}
              />
            )
          }
        </MultiSwrContent>
      </Accordion.Body>
    </Accordion.Item>
  );
};

const StudentProgress = ({
  klass,
  session,
  studentId,
}: {
  klass: ExistingClassExtended;
  session: ExistingSessionExtended;
  studentId: number;
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(
    undefined,
  );

  const {
    data: solutions,
    error: solutionsError,
    isLoading: isLoadingSolutions,
  } = useAllSessionSolutions(klass.id, session.id);

  const progressByTask: ProgressByTask = useMemo(() => {
    if (!solutions) {
      return {};
    }

    return solutions.reduce((acc, sessionSolutions) => {
      const solution = ExistingSolution.findSolutionToDisplay(
        sessionSolutions.solutions.filter((s) => s.studentId === studentId),
      );

      if (solution) {
        acc[solution.taskId] = solution;
      }

      return acc;
    }, {} as ProgressByTask);
  }, [studentId, solutions]);

  useEffect(() => {
    const selectedTask = session.tasks.find(
      (task) => task.id === selectedTaskId,
    );

    // if there is no selected task or the selected task is no longer in the session
    if (selectedTaskId === undefined || !selectedTask) {
      setSelectedTaskId(session.tasks[0]?.id ?? undefined);
    }
  }, [selectedTaskId, session]);

  return (
    <SwrContent
      data={solutions}
      error={solutionsError}
      isLoading={isLoadingSolutions}
    >
      {(_solutions) => (
        <Accordion
          defaultActiveKey={selectedTaskId?.toString()}
          onSelect={(taskId) =>
            setSelectedTaskId(
              taskId && !Array.isArray(taskId)
                ? parseInt(taskId, 10)
                : undefined,
            )
          }
        >
          {session.tasks.map((task) =>
            progressByTask[task.id] ? (
              <UserTaskProgress
                key={task.id}
                classId={klass.id}
                sessionId={session.id}
                task={task}
                progress={progressByTask[task.id]}
                open={task.id === selectedTaskId}
              />
            ) : null,
          )}
        </Accordion>
      )}
    </SwrContent>
  );
};

export default StudentProgress;
