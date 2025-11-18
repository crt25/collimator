import { defineMessages } from "react-intl";
import { LuSettings2, LuMilestone } from "react-icons/lu";
import { TbUsers } from "react-icons/tb";
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
  lessonsTab: {
    id: "ClassNavigation.lessonsTab",
    defaultMessage: "Lessons",
  },
});

const tabs: NavigationTab[] = [
  {
    url: "detail",
    title: (intl) => intl.formatMessage(messages.classTab),
    testId: "class-details-tab",
    icon: <LuSettings2 />,
  },
  {
    url: "session",
    title: (intl) => intl.formatMessage(messages.lessonsTab),
    testId: "class-sessions-tab",
    icon: <TbUsers />,
  },
  {
    url: "students",
    title: (intl) => intl.formatMessage(messages.studentsTab),
    testId: "class-students-tab",
    icon: <LuMilestone />,
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
