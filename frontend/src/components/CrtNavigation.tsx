import { defineMessages } from "react-intl";
import TabNavigation, { NavigationTab } from "./TabNavigation";
import BreadcrumbItem from "./BreadcrumbItem";
import { ExistingClass } from "@/api/collimator/models/classes/existing-class";
import { ExistingUser } from "@/api/collimator/models/users/existing-user";

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
  user,
  klass,
  lessonId,
}: {
  breadcrumb?: boolean;
  user?: ExistingUser;
  klass?: ExistingClass;
  lessonId?: number;
}) => {
  const lessonName = "Introduction to React";

  return (
    <>
      <TabNavigation tabs={tabs} breadcrumb={breadcrumb} />
      {breadcrumb && (
        <>
          {user && (
            <BreadcrumbItem href={`/user/${user.id}`}>
              {user.name || user.email}
            </BreadcrumbItem>
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
