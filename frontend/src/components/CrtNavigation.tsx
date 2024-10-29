import { defineMessages } from "react-intl";
import TabNavigation, { NavigationTab } from "./TabNavigation";
import BreadcrumbItem from "./BreadcrumbItem";

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
  classId,
  lessonId,
}: {
  breadcrumb?: boolean;
  userId?: number;
  classId?: number;
  lessonId?: number;
}) => {
  const userName = "John";
  const className = "2018e";
  const lessonName = "Introduction to React";

  return (
    <>
      <TabNavigation tabs={tabs} breadcrumb={breadcrumb} />
      {breadcrumb && (
        <>
          {userId && (
            <BreadcrumbItem href={`/user/${userId}`}>{userName}</BreadcrumbItem>
          )}
          {classId && (
            <BreadcrumbItem href={`/class/${classId}/detail`}>
              {className}
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
