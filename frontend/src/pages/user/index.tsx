import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import UserList from "@/components/user/UserList";

const messages = defineMessages({
  title: {
    id: "ListUsers.title",
    defaultMessage: "Users",
  },
});

const ListUsers = () => {
  return (
    <>
      <Header title={messages.title} />
      <Container>
        <Breadcrumbs />
        <CrtNavigation />
        <PageHeader>
          <FormattedMessage
            id="ListUsers.header"
            defaultMessage="User Manager"
          />
        </PageHeader>
        <UserList />
      </Container>
    </>
  );
};

export default ListUsers;
