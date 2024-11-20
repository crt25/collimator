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
  studentsTab: {
    id: "ClassNavigation.studentsTab",
    defaultMessage: "Students",
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
    url: "students",
    title: (intl) => intl.formatMessage(messages.studentsTab),
  },
  {
    url: "session",
    title: (intl) => intl.formatMessage(messages.sesstionsTab),
  },
];

const ClassNavigation = ({
  classId,
  session,
  breadcrumb,
}: {
  classId?: number;
  session?: ExistingSession | ExistingSessionExtended;
  breadcrumb?: boolean;
}) => {
  const prefix = `/class/${classId}/`;

  return (
    <>
      <TabNavigation tabs={tabs} prefix={prefix} breadcrumb={breadcrumb} />
      {breadcrumb && (
        <>
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
