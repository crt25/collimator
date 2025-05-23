import { useRouter } from "next/router";
import { Container, Table } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import UserNavigation from "@/components/user/UserNavigation";
import { useUser } from "@/api/collimator/hooks/users/useUser";
import SwrContent from "@/components/SwrContent";

const messages = defineMessages({
  title: {
    id: "UserDetail.title",
    defaultMessage: "User - {name}",
  },
});

const UserDetail = () => {
  const router = useRouter();
  const { userId } = router.query as {
    userId: string;
  };

  const { data: user, isLoading, error } = useUser(userId);

  return (
    <>
      <Header
        title={messages.title}
        titleParameters={{
          name: user?.name ?? "",
        }}
      />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb />
        </Breadcrumbs>
        <UserNavigation userId={user?.id} />
        <SwrContent error={error} isLoading={isLoading} data={user}>
          {(user) => (
            <div>
              <PageHeader>{user.name ?? user.oidcSub}</PageHeader>
              <Table bordered role="presentation" data-testid="user-details">
                <tbody>
                  <tr>
                    <td>
                      <FormattedMessage
                        id="UserDetail.table.oidcSub"
                        defaultMessage="OpenId Connect Identifier"
                      />
                    </td>
                    <td>{user.oidcSub}</td>
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
