import { defineMessages } from "react-intl";
import { LuBadgeCheck, LuSettings2, LuView } from "react-icons/lu";
import TabNavigation, { NavigationTab } from "../TabNavigation";

const messages = defineMessages({
  taskTab: {
    id: "TaskNavigation.classTab",
    defaultMessage: "Task Details",
  },

  referenceSolutionsTab: {
    id: "TaskNavigation.referenceSolutions",
    defaultMessage: "Reference Solutions",
  },
  viewTaskTab: {
    id: "TaskNavigation.viewTaskTab",
    defaultMessage: "View Task",
  },
});

const tabs: NavigationTab[] = [
  {
    url: "detail",
    title: (intl) => intl.formatMessage(messages.taskTab),
    icon: <LuSettings2 />,
  },
  {
    url: "reference-solutions",
    title: (intl) => intl.formatMessage(messages.referenceSolutionsTab),
    icon: <LuBadgeCheck />,
    testId: "task-instance-reference-solutions-tab",
  },
  {
    url: "view",
    title: (intl) => intl.formatMessage(messages.viewTaskTab),
    icon: <LuView />,
  },
];

const TaskNavigation = ({
  taskId,
  breadcrumb,
}: {
  taskId?: number;
  breadcrumb?: boolean;
}) => {
  const prefix = `/task/${taskId}/`;

  return <TabNavigation tabs={tabs} prefix={prefix} breadcrumb={breadcrumb} />;
};

export default TaskNavigation;
