import { defineMessages } from "react-intl";
import TabNavigation, { NavigationTab } from "../TabNavigation";
import BreadcrumbItem from "../BreadcrumbItem";
import { ClassStudent } from "@/api/collimator/models/classes/class-student";
import { StudentName } from "../encryption/StudentName";

const messages = defineMessages({
  progressTab: {
    id: "SessionNavigation.progress",
    defaultMessage: "Progress",
  },
  manualGroupingTab: {
    id: "SessionNavigation.manualGroupingTab",
    defaultMessage: "Manual Grouping",
  },
  automaticGroupingTab: {
    id: "SessionNavigation.automaticGroupingTab",
    defaultMessage: "Automatic Grouping",
  },
});

const tabs: NavigationTab[] = [
  {
    url: "progress",
    title: (intl) => intl.formatMessage(messages.progressTab),
  },
  {
    url: "manual-grouping",
    title: (intl) => intl.formatMessage(messages.manualGroupingTab),
  },
  {
    url: "automatic-grouping",
    title: (intl) => intl.formatMessage(messages.automaticGroupingTab),
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
        <StudentName student={student} />
      </BreadcrumbItem>
    )}
  </>
);

export default SessionNavigation;
