import { defineMessages } from "react-intl";
import CrtNavigation from "@/components/CrtNavigation";
import UserList from "@/components/user/UserList";
import PageLayout from "@/components/layout/PageLayout";

const messages = defineMessages({
  title: {
    id: "ListUsers.title",
    defaultMessage: "Users",
  },
  heading: {
    id: "ListUsers.header",
    defaultMessage: "User Manager",
  },
});

const ListUsers = () => {
  return (
    <PageLayout
      title={messages.title}
      heading={messages.heading}
      breadcrumbs={<CrtNavigation breadcrumb />}
    >
      <UserList />
    </PageLayout>
  );
};

export default ListUsers;
