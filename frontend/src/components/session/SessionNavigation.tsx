import { defineMessages } from "react-intl";
import TabNavigation, { NavigationTab } from "../TabNavigation";
import BreadcrumbItem from "../BreadcrumbItem";

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
  userId,
  breadcrumb,
}: {
  classId?: number;
  sessionId?: number;
  userId?: number;
  breadcrumb?: boolean;
}) => {
  const userName = "John";

  return (
    <>
      <TabNavigation
        tabs={tabs}
        prefix={`/class/${classId}/session/${sessionId}/`}
        breadcrumb={breadcrumb}
      />
      {breadcrumb && userId && (
        <BreadcrumbItem href={`/user/${userId}`}>{userName}</BreadcrumbItem>
      )}
    </>
  );
};

export default SessionNavigation;
