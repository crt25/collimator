import { defineMessages } from "react-intl";
import TabNavigation, { NavigationTab } from "./TabNavigation";
import BreadcrumbItem from "./BreadcrumbItem";
import { ExistingClass } from "@/api/collimator/models/classes/existing-class";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";

const messages = defineMessages({
  usersTab: {
    id: "CrtNavigation.usersTab",
    defaultMessage: "Users",
  },
  classesTab: {
    id: "CrtNavigation.classesTab",
    defaultMessage: "Classes",
  },
  lessonsTab: {
    id: "CrtNavigation.lessonsTab",
    defaultMessage: "Lessons",
  },
});

const tabs: NavigationTab[] = [
  {
    url: "/user",
    title: (intl) => intl.formatMessage(messages.usersTab),
  },
  {
    url: "/class",
    title: (intl) => intl.formatMessage(messages.classesTab),
  },
  {
    url: "/lesson",
    title: (intl) => intl.formatMessage(messages.lessonsTab),
  },
];

const CrtNavigation = ({
  breadcrumb,
  userId,
  klass,
  lessonId,
}: {
  breadcrumb?: boolean;
  userId?: number;
  klass?: ExistingClass | ExistingClassExtended;
  lessonId?: number;
}) => {
  const userName = "John";
  const lessonName = "Introduction to React";

  return (
    <>
      <TabNavigation tabs={tabs} breadcrumb={breadcrumb} />
      {breadcrumb && (
        <>
          {userId && (
            <BreadcrumbItem href={`/user/${userId}`}>{userName}</BreadcrumbItem>
          )}
          {klass && (
            <BreadcrumbItem href={`/class/${klass.id}/detail`}>
              {klass.name}
            </BreadcrumbItem>
          )}
          {lessonId && (
            <BreadcrumbItem href={`/lesson/${lessonId}`}>
              {lessonName}
            </BreadcrumbItem>
          )}
        </>
      )}
    </>
  );
};

export default CrtNavigation;
