import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { getSessionsControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/sessions/sessions.msw";
import TaskList from "./TaskList";

type Args = Parameters<typeof TaskList>[0];

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

const session = ExistingSessionExtended.fromDto(
  getSessionsControllerFindOneV0ResponseMock(),
);

export const Default = {
  args: {
    classId: 1,
    session,
  } as Args,
};

export const WithActiveFirstItem = {
  args: {
    classId: 1,
    session,
    currentTaskId: session.tasks[0].id,
  } as Args,
};
