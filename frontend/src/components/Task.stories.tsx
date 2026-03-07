import { useState, useRef } from "storybook/preview-api";
import { INITIAL_VIEWPORTS } from "storybook/viewport";
import { getSessionsControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/sessions/sessions.msw";
import { getTasksControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/tasks/tasks.msw";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { UserRole } from "@/types/user/user-role";
import StudentKeyPair from "@/utilities/crypto/StudentKeyPair";
import Task from "./Task";
import { EmbeddedAppRef } from "./EmbeddedApp";
// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta as MetaType } from "@storybook/react";

type Args = Omit<
  Parameters<typeof Task>[0],
  "showSessionMenu" | "setShowSessionMenu" | "embeddedApp"
>;

const mockStudentContext = {
  version: "2" as const,
  isAnonymous: true as const,
  idToken: undefined,
  authenticationToken: "mock-token",
  studentId: 1,
  sessionId: 1,
  name: "Test Student",
  role: UserRole.student as UserRole.student,
  teacherPublicKey: {} as JsonWebKey,
  keyPair: {} as StudentKeyPair,
  ephemeralKey: undefined,
  pseudonym: undefined,
};

const meta: MetaType<typeof Task> = {
  component: Task,
  parameters: {
    viewports: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: "ipad",
    },
  },
};

export default meta;

const session = ExistingSessionExtended.fromDto(
  getSessionsControllerFindOneV0ResponseMock(),
);

const task = ExistingTask.fromDto(getTasksControllerFindOneV0ResponseMock());

export const Default = {
  args: {
    classId: 1,
    session,
    task,
    iframeSrc: "https://example.com",
  } as Args,
  render: (args: Args) => {
    const [showSessionMenu, setShowSessionMenu] = useState(false);
    const embeddedApp = useRef<EmbeddedAppRef | null>(null);

    return (
      <div
        style={{
          minHeight: "30rem",
          display: "flex",
        }}
      >
        <AuthenticationContext.Provider value={mockStudentContext}>
          <Task
            {...args}
            showSessionMenu={showSessionMenu}
            setShowSessionMenu={setShowSessionMenu}
            embeddedApp={embeddedApp}
          />
        </AuthenticationContext.Provider>
      </div>
    );
  },
};

export const WithOpenSessionMenu = {
  args: {
    classId: 1,
    session,
    task,
    iframeSrc: "https://example.com",
  } as Args,
  render: (args: Args) => {
    const [showSessionMenu, setShowSessionMenu] = useState(true);
    const embeddedApp = useRef<EmbeddedAppRef | null>(null);

    return (
      <div
        style={{
          minHeight: "30rem",
          display: "flex",
        }}
      >
        <AuthenticationContext.Provider value={mockStudentContext}>
          <Task
            {...args}
            showSessionMenu={showSessionMenu}
            setShowSessionMenu={setShowSessionMenu}
            embeddedApp={embeddedApp}
          />
        </AuthenticationContext.Provider>
      </div>
    );
  },
};
