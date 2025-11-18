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
    id: "ListTasks.description",
    defaultMessage: "",
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
          description={
            <FormattedMessage
              id="ListTasks.pageDescription"
              defaultMessage=""
            />
          }
        >
          <FormattedMessage id="ListTasks.header" defaultMessage="Task Bank" />
        </PageHeading>
        <TaskTable />
      </Container>
    </>
  );
};

export default ListTasks;
