import { defineMessages } from "react-intl";
import { LuListTodo, LuSettings2, LuTrendingUp } from "react-icons/lu";
import { ClassStudent } from "@/api/collimator/models/classes/class-student";
import TabNavigation, { NavigationTab } from "../TabNavigation";
import BreadcrumbItem from "../BreadcrumbItem";
import { StudentName } from "../encryption/StudentName";

const messages = defineMessages({
  lessonDetailsTab: {
    id: "SessionNavigation.lessonDetails",
    defaultMessage: "Lesson Details",
  },
  tasksTab: {
    id: "SessionNavigation.tasks",
    defaultMessage: "Tasks",
  },
  progressTab: {
    id: "SessionNavigation.progress",
    defaultMessage: "Progress",
  },
});

const tabs: NavigationTab[] = [
  {
    url: "edit",
    title: (intl) => intl.formatMessage(messages.lessonDetailsTab),
    icon: <LuSettings2 />,
    testId: "session-lesson-details-tab",
  },
  {
    url: "task",
    title: (intl) => intl.formatMessage(messages.tasksTab),
    icon: <LuListTodo />,
    testId: "session-tasks-tab",
  },
  {
    url: "progress",
    title: (intl) => intl.formatMessage(messages.progressTab),
    icon: <LuTrendingUp />,
    testId: "session-progress-tab",
  },
];

const SessionNavigation = ({
  classId,
  sessionId,
  student,
  breadcrumb,
}: {
  classId?: number;
  sessionId?: number;
  student?: ClassStudent;
  breadcrumb?: boolean;
}) => (
  <>
    <TabNavigation
      tabs={tabs}
      prefix={`/class/${classId}/session/${sessionId}/`}
      breadcrumb={breadcrumb}
    />
    {breadcrumb && student && (
      <BreadcrumbItem>
        <StudentName
          studentId={student.studentId}
          pseudonym={student.pseudonym}
          keyPairId={student.keyPairId}
        />
      </BreadcrumbItem>
    )}
  </>
);

export default SessionNavigation;
