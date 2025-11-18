import { useRouter } from "next/router";
import { useMemo } from "react";
import { chakra } from "@chakra-ui/react";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { useSessionProgress } from "@/api/collimator/hooks/sessions/useSessionProgress";
import { StudentSessionProgress } from "@/api/collimator/models/sessions/student-session-progress";
import { TaskProgress } from "@/api/collimator/generated/models";
import SwrContent from "./SwrContent";
import TaskListItem from "./TaskListItem";

const TaskListWrapper = chakra("menu", {
  base: {
    flexGrow: 1,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "sm",
    overflowY: "scroll",
  },
});

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
