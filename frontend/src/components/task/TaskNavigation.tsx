import { defineMessages } from "react-intl";
import TabNavigation, { NavigationTab } from "../TabNavigation";

const messages = defineMessages({
  taskTab: {
    id: "TaskNavigation.classTab",
    defaultMessage: "Task Details",
  },
});

const tabs: NavigationTab[] = [
  {
    url: "detail",
    title: (intl) => intl.formatMessage(messages.taskTab),
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
