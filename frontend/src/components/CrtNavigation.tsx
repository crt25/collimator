import { defineMessages } from "react-intl";
import TabNavigation, { NavigationTab } from "./TabNavigation";
import BreadcrumbItem from "./BreadcrumbItem";
import { ExistingClass } from "@/api/collimator/models/classes/existing-class";
import { ExistingUser } from "@/api/collimator/models/users/existing-user";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import { UserRole } from "@/types/user/user-role";

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
  tasksTab: {
    id: "CrtNavigation.tasksTab",
    defaultMessage: "Tasks",
  },
});

const tabs: NavigationTab[] = [
  {
    url: "/user",
    title: (intl) => intl.formatMessage(messages.usersTab),
    isShown: (authContext) => authContext.role === UserRole.admin,
  },
  {
    url: "/class",
    title: (intl) => intl.formatMessage(messages.classesTab),
  },
  // {
  //   url: "/lesson",
  //   title: (intl) => intl.formatMessage(messages.lessonsTab),
  // },
  {
    url: "/task",
    title: (intl) => intl.formatMessage(messages.tasksTab),
  },
];

const CrtNavigation = ({
  breadcrumb,
  user,
  klass,
  task,
  lessonId,
}: {
  breadcrumb?: boolean;
  user?: ExistingUser;
  klass?: ExistingClass | ExistingClassExtended;
  task?: ExistingTask;
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
              {user.name ?? user.oidcSub}
            </BreadcrumbItem>
          )}
          {klass && (
            <BreadcrumbItem href={`/class/${klass.id}/detail`}>
              {klass.name}
            </BreadcrumbItem>
          )}
          {task && (
            <BreadcrumbItem href={`/task/${task.id}/detail`}>
              {task.title}
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
