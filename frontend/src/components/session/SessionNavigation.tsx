import { defineMessages } from "react-intl";
import TabNavigation, { NavigationTab } from "../TabNavigation";
import BreadcrumbItem from "../BreadcrumbItem";
import { ExistingUser } from "@/api/collimator/models/users/existing-user";

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
  user,
  breadcrumb,
}: {
  classId?: number;
  sessionId?: number;
  user?: ExistingUser;
  breadcrumb?: boolean;
}) => (
  <>
    <TabNavigation
      tabs={tabs}
      prefix={`/class/${classId}/session/${sessionId}/`}
      breadcrumb={breadcrumb}
    />
    {breadcrumb && user && (
      <BreadcrumbItem href={`/user/${user.id}`}>
        {user.name ?? user.email}
      </BreadcrumbItem>
    )}
  </>
);

export default SessionNavigation;
