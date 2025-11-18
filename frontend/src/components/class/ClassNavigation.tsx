import { defineMessages } from "react-intl";
import { LuSettings2, LuMap, LuUsers, LuSignpost } from "react-icons/lu";
import { Breadcrumb, Icon } from "@chakra-ui/react";
import { ExistingSession } from "@/api/collimator/models/sessions/existing-session";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import TabNavigation, { NavigationTab } from "../TabNavigation";
import BreadcrumbItem from "../BreadcrumbItem";

const messages = defineMessages({
  classTab: {
    id: "ClassNavigation.classTab",
    defaultMessage: "Class Details",
  },
  studentsTab: {
    id: "ClassNavigation.studentsTab",
    defaultMessage: "Students",
  },
  sessionsTab: {
    id: "ClassNavigation.sessionsTab",
    defaultMessage: "Lessons",
  },
});

const tabs: NavigationTab[] = [
  {
    url: "detail",
    title: (intl) => intl.formatMessage(messages.classTab),
    icon: <LuSettings2 />,
    testId: "class-details-tab",
  },
  {
    url: "session",
    title: (intl) => intl.formatMessage(messages.sessionsTab),
    icon: <LuSignpost />,
    testId: "class-sessions-tab",
  },
  {
    url: "students",
    title: (intl) => intl.formatMessage(messages.studentsTab),
    icon: <LuUsers />,
    testId: "class-students-tab",
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
            <>
              <Breadcrumb.Separator />
              <BreadcrumbItem href={`${prefix}session/${session.id}/progress`}>
                <Icon>
                  <LuMap />
                </Icon>
                {session.title}
              </BreadcrumbItem>
            </>
          )}
        </>
      )}
    </>
  );
};

export default ClassNavigation;
