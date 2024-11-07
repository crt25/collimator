import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import UserList from "@/components/user/UserList";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { useFetchAllUsers } from "@/api/collimator/hooks/users/useAllUsers";

const ListUsers = () => {
  const fetchData = useFetchAllUsers();

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs />
        <CrtNavigation />
        <PageHeader>
          <FormattedMessage
            id="ListUsers.header"
            defaultMessage="User Manager"
          />
        </PageHeader>
        <UserList fetchData={fetchData} />
      </Container>
    </>
  );
};

export default ListUsers;
