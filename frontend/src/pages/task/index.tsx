import { defineMessages, FormattedMessage } from "react-intl";
import CrtNavigation from "@/components/CrtNavigation";
import TaskTable from "@/components/task/TaskTable";
import PageLayout from "@/components/layout/Page";

const messages = defineMessages({
  title: {
    id: "ListTasks.title",
    defaultMessage: "Tasks",
  },
  heading: {
    id: "ListTasks.header",
    defaultMessage: "Task Bank",
  },
  description: {
    id: "ListTasks.pageDescription",
    defaultMessage:
      "This page displays all the existing ClassMosaic tasks " +
      "that you can include in your lessons.",
  },
});

const ListTasks = () => {
  return (
    <PageLayout
      title={messages.title}
      heading={messages.heading}
      description={<FormattedMessage {...messages.description} />}
      breadcrumbs={<CrtNavigation breadcrumb />}
    >
      <TaskTable />
    </PageLayout>
  );
};

export default ListTasks;
