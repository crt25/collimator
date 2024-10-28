import TaskList from "./TaskList";

export default {
  component: TaskList,
  title: "TaskList",
  render: (args: Parameters<typeof TaskList>[0]) => (
    <div
      style={{
        display: "flex",
        height: "20rem",
      }}
    >
      <TaskList {...args} />
    </div>
  ),
};

export const Default = {
  args: {
    sessionId: 1,
  },
};
