import styled from "@emotion/styled";
import TaskListItem from "./TaskListItem";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { useRouter } from "next/router";
import { useSessionProgress } from "@/api/collimator/hooks/sessions/useSessionProgress";
import SwrContent from "./SwrContent";
import { StudentSessionProgress } from "@/api/collimator/models/sessions/student-session-progress";
import { useMemo } from "react";
import { TaskProgress } from "@/api/collimator/generated/models";

const TaskListWrapper = styled.menu`
  flex-grow: 1;

  list-style: none;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  overflow-y: scroll;
`;

const TaskListInner = ({
  classId,
  session,
  currentTaskId,
  progress,
}: {
  classId: number;
  session: ExistingSessionExtended;
  currentTaskId?: number;
  progress: StudentSessionProgress;
}) => {
  const router = useRouter();

  const progressByTaskId = useMemo(
    () =>
      progress.taskProgress.reduce(
        (byId, taskProgress) => {
          byId[taskProgress.id] = taskProgress.taskProgress;

          return byId;
        },
        {} as { [key: number]: TaskProgress },
      ),
    [progress],
  );

  return (
    <TaskListWrapper>
      {session.tasks.map((task) => (
        <TaskListItem
          key={task.id}
          progress={progressByTaskId[task.id]}
          active={currentTaskId === task.id}
          onClick={() =>
            router.push(
              `/class/${classId}/session/${session.id}/task/${task.id}/solve`,
            )
          }
        >
          {task.title}
        </TaskListItem>
      ))}
    </TaskListWrapper>
  );
};

const TaskList = ({
  classId,
  session,
  currentTaskId,
}: {
  classId: number;
  session: ExistingSessionExtended;
  currentTaskId?: number;
}) => {
  const {
    data: progress,
    isLoading: isLoadingProgress,
    error: progressError,
  } = useSessionProgress(classId, session.id);

  return (
    <SwrContent
      data={progress}
      isLoading={isLoadingProgress}
      error={progressError}
    >
      {(progress) => (
        <TaskListInner
          classId={classId}
          session={session}
          currentTaskId={currentTaskId}
          progress={progress}
        />
      )}
    </SwrContent>
  );
};

export default TaskList;
