import { TaskStatus } from "@/types/task/task-status";
import TaskListItem from "./TaskListItem";

type Args = Parameters<typeof TaskListItem>[0];

export default {
  component: TaskListItem,
  title: "TaskListItem",
  render: (args: Args) => (
    <ul
      style={{
        listStyleType: "none",
        padding: 0,
      }}
    >
      <TaskListItem {...args} />
    </ul>
  ),
};

export const Unopened = {
  args: {
    children: "Task 1",
    status: TaskStatus.unOpened,
  } as Args,
};

export const Opened = {
  args: {
    children: "Task 1",
    status: TaskStatus.opened,
  } as Args,
};

export const PartiallyDone = {
  args: {
    children: "Task 1",
    status: TaskStatus.partiallyDone,
  } as Args,
};

export const Done = {
  args: {
    children: "Task 1",
    status: TaskStatus.done,
  } as Args,
};
