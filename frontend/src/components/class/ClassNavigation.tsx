import { defineMessages } from "react-intl";
import TabNavigation, { NavigationTab } from "../TabNavigation";
import BreadcrumbItem from "../BreadcrumbItem";

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
  sessionId,
  breadcrumb,
}: {
  classId?: number;
  userId?: number;
  sessionId?: number;
  breadcrumb?: boolean;
}) => {
  const prefix = `/class/${classId}/`;
  const userName = "John";
  const sessionName = "Introduction to React";

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
          {sessionId && (
            <BreadcrumbItem href={`${prefix}session/${sessionId}/progress`}>
              {sessionName}
            </BreadcrumbItem>
          )}
        </>
      )}
    </>
  );
};

export default ClassNavigation;
