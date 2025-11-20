import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/header/Header";
import CrtNavigation from "@/components/CrtNavigation";
import UserList from "@/components/user/UserList";
import PageHeading from "@/components/PageHeading";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "ListUsers.title",
    defaultMessage: "Users",
  },
});

const ListUsers = () => {
  return (
    <MaxScreenHeight>
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
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default ListUsers;
