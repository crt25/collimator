import SessionActions from "./session/SessionActions";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";

type Args = Parameters<typeof SessionActions>[0];

export default {
  component: SessionActions,
  title: "SessionActions",
};

const mockClass = {
  id: 1,
  name: "Sample Class",
  teacher: {
    id: 1,
    name: "Teacher Name",
    email: "teacher@example.com",
  },
  sessions: [1, 2, 3],
  students: [],
} as unknown as ExistingClassExtended;

const mockSession = {
  id: 1,
  title: "Sample Session",
  date: "2024-01-01",
  description: "This is a sample session.",
  isAnonymous: false,
  klass: mockClass,
  lesson: null,
  createdAt: "2024-01-01T00:00:00Z",
  status: "active",
  tasks: [],
} as unknown as ExistingSessionExtended;

export const Default = {
  args: {
    klass: mockClass,
    session: mockSession,
  } as Args,
};
