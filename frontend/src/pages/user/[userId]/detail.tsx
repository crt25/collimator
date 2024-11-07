import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { useRouter } from "next/router";
import { Container, Table } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import UserNavigation from "@/components/user/UserNavigation";
import { useUser } from "@/api/collimator/hooks/users/useUser";
import SwrContent from "@/components/SwrContent";

const UserDetail = () => {
  const router = useRouter();
  const { userId } = router.query as {
    userId: string;
  };

  const { data: user, isLoading, error } = useUser(userId);

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb />
        </Breadcrumbs>
        <UserNavigation userId={user?.id} />
        <SwrContent error={error} isLoading={isLoading} data={user}>
          {(user) => (
            <div>
              <PageHeader>{user.name}</PageHeader>
              <Table bordered>
                <tbody>
                  <tr>
                    <td>
                      <FormattedMessage
                        id="UserDetail.table.email"
                        defaultMessage="Email"
                      />
                    </td>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <td>
                      <FormattedMessage
                        id="UserDetail.table.type"
                        defaultMessage="Type"
                      />
                    </td>
                    <td>{user.type}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          )}
        </SwrContent>
      </Container>
    </>
  );
};

export default UserDetail;
