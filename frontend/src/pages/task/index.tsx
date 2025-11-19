import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import TaskTable from "@/components/task/TaskTable";
import PageHeading from "@/components/PageHeading";

const messages = defineMessages({
  title: {
    id: "ListTasks.title",
    defaultMessage: "Tasks",
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
    <>
      <Header title={messages.title} />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb />
        </Breadcrumbs>
        <PageHeading
          description={<FormattedMessage {...messages.description} />}
        >
          <FormattedMessage id="ListTasks.header" defaultMessage="Task Bank" />
        </PageHeading>
        <TaskTable />
      </Container>
    </>
  );
};

export default ListTasks;
