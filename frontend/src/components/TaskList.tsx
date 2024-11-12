import styled from "@emotion/styled";
import TaskListItem from "./TaskListItem";
import { TaskStatus } from "@/types/task/task-status";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { useRouter } from "next/router";

const TaskListWrapper = styled.menu`
  flex-grow: 1;

  list-style: none;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  overflow-y: scroll;
`;

const TaskList = ({
  classId,
  session,
  currentTaskId,
}: {
  classId: number;
  session: ExistingSessionExtended;
  currentTaskId?: number;
}) => {
  const router = useRouter();

  return (
    <TaskListWrapper>
      {session.tasks.map((task) => (
        // get status for current user
        <TaskListItem
          key={task.id}
          status={TaskStatus.unOpened}
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

export default TaskList;
