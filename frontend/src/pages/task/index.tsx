import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import TaskTable from "@/components/task/TaskTable";

const messages = defineMessages({
  title: {
    id: "ListTasks.title",
    defaultMessage: "Tasks",
  },
});

const ListTasks = () => {
  return (
    <>
      <Header title={messages.title} />
      <Container>
        <Breadcrumbs />
        <CrtNavigation />
        <PageHeader>
          <FormattedMessage
            id="ListTasks.header"
            defaultMessage="Task Manager"
          />
        </PageHeader>
        <TaskTable />
      </Container>
    </>
  );
};

export default ListTasks;
