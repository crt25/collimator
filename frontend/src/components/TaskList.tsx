import styled from "@emotion/styled";
import TaskListItem from "./TaskListItem";
import { TaskStatus } from "@/types/task/task-status";

const TaskListWrapper = styled.menu`
  flex-grow: 1;

  list-style: none;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  overflow-y: scroll;
`;

const TaskList = ({ sessionId }: { sessionId: number }) => {
  return (
    <TaskListWrapper>
      <TaskListItem status={TaskStatus.done}>Task 1</TaskListItem>
      <TaskListItem status={TaskStatus.partiallyDone}>Task 2</TaskListItem>
      <TaskListItem status={TaskStatus.opened}>Task 3</TaskListItem>
      <TaskListItem status={TaskStatus.unOpened}>Task 4</TaskListItem>
      <TaskListItem status={TaskStatus.unOpened}>Task 5</TaskListItem>
      <TaskListItem status={TaskStatus.opened}>
        Task 6 with a very very very very very very very very very very very
        very very very very long title
      </TaskListItem>
      <TaskListItem status={TaskStatus.unOpened}>Task 5</TaskListItem>
      <TaskListItem status={TaskStatus.unOpened}>Task 5</TaskListItem>
      <TaskListItem status={TaskStatus.unOpened}>Task 5</TaskListItem>
      <TaskListItem status={TaskStatus.unOpened}>Task 5</TaskListItem>
      <TaskListItem status={TaskStatus.unOpened}>Task 5</TaskListItem>
      <TaskListItem status={TaskStatus.unOpened}>Task 5</TaskListItem>
      <TaskListItem status={TaskStatus.unOpened}>Task 5</TaskListItem>
      <TaskListItem status={TaskStatus.unOpened}>Task 5</TaskListItem>
    </TaskListWrapper>
  );
};

export default TaskList;
