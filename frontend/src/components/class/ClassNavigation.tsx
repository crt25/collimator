import { defineMessages } from "react-intl";
import TabNavigation, { NavigationTab } from "../TabNavigation";
import BreadcrumbItem from "../BreadcrumbItem";
import { ExistingSession } from "@/api/collimator/models/sessions/existing-session";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";

const messages = defineMessages({
  classTab: {
    id: "ClassNavigation.classTab",
    defaultMessage: "Class Details",
  },
  usersTab: {
    id: "ClassNavigation.usersTab",
    defaultMessage: "Users",
  },
  sesstionsTab: {
    id: "ClassNavigation.sessionsTab",
    defaultMessage: "Sessions",
  },
});

const tabs: NavigationTab[] = [
  {
    url: "detail",
    title: (intl) => intl.formatMessage(messages.classTab),
  },
  {
    url: "user",
    title: (intl) => intl.formatMessage(messages.usersTab),
  },
  {
    url: "session",
    title: (intl) => intl.formatMessage(messages.sesstionsTab),
  },
];

const ClassNavigation = ({
  classId,
  userId,
  session,
  breadcrumb,
}: {
  classId?: number;
  userId?: number;
  session?: ExistingSession | ExistingSessionExtended;
  breadcrumb?: boolean;
}) => {
  const prefix = `/class/${classId}/`;
  const userName = "John";

  return (
    <>
      <TabNavigation tabs={tabs} prefix={prefix} breadcrumb={breadcrumb} />
      {breadcrumb && (
        <>
          {userId && (
            <BreadcrumbItem href={`${prefix}user/${userId}`}>
              {userName}
            </BreadcrumbItem>
          )}
          {session && (
            <BreadcrumbItem href={`${prefix}session/${session.id}/progress`}>
              {session.title}
            </BreadcrumbItem>
          )}
        </>
      )}
    </>
  );
};

export default ClassNavigation;
