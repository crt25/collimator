import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import { Heading } from "@chakra-ui/react";
import styled from "@emotion/styled";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { TaskTable } from "@/components/task/TaskTable";

const StyledHeading = styled(Heading)`
  margin-top: 2rem;
  margin-bottom: 1rem;
`;

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

const PageDescription = styled.p`
  font-size: 1.5rem;
  color: var(--page-description-color);
  margin-top: 1rem;
  margin-bottom: 3rem;
`;

const ListTasks = () => {
  return (
    <>
      <Header title={messages.title} />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb />
        </Breadcrumbs>
        <StyledHeading>
          <FormattedMessage id="ListTasks.header" defaultMessage="Task Bank" />
        </StyledHeading>
        <PageDescription>
          <FormattedMessage id="ListTasks.pageDescription" defaultMessage="" />
        </PageDescription>
        <TaskTable />
      </Container>
    </>
  );
};

export default ListTasks;
