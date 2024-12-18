import { TaskProgress } from "@/api/collimator/generated/models";
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
    progress: TaskProgress.unOpened,
  } as Args,
};

export const Opened = {
  args: {
    children: "Task 1",
    progress: TaskProgress.opened,
  } as Args,
};

export const PartiallyDone = {
  args: {
    children: "Task 1",
    progress: TaskProgress.partiallyDone,
  } as Args,
};

export const Done = {
  args: {
    children: "Task 1",
    progress: TaskProgress.done,
  } as Args,
};
