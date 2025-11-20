import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/header/Header";
import CrtNavigation from "@/components/CrtNavigation";
import UserList from "@/components/user/UserList";
import PageHeading from "@/components/PageHeading";

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
        <PageHeading>
          <FormattedMessage
            id="ListUsers.header"
            defaultMessage="User Manager"
          />
        </PageHeading>
        <UserList />
      </Container>
    </>
  );
};

export default ListUsers;
