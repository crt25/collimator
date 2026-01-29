import { useRouter } from "next/router";
import { defineMessages, FormattedMessage } from "react-intl";
import { Container, Table } from "@chakra-ui/react";
import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/header/Header";
import CrtNavigation from "@/components/CrtNavigation";
import UserNavigation from "@/components/user/UserNavigation";
import { useUser } from "@/api/collimator/hooks/users/useUser";
import SwrContent from "@/components/SwrContent";
import PageHeading from "@/components/PageHeading";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";
import UserActions from "@/components/user/UserActions";

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
    <MaxScreenHeight>
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
        <SwrContent error={error} isLoading={isLoading} data={user}>
          {(user) => (
            <div>
              <PageHeading actions={<UserActions user={user} />}>
                {user.name ?? user.oidcSub}
              </PageHeading>
              <UserNavigation userId={user?.id} />
              <Table.Root role="presentation" data-testid="user-details">
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>
                      <FormattedMessage
                        id="UserDetail.table.oidcSub"
                        defaultMessage="OpenId Connect Identifier"
                      />
                    </Table.Cell>
                    <Table.Cell>{user.oidcSub}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>
                      <FormattedMessage
                        id="UserDetail.table.type"
                        defaultMessage="Type"
                      />
                    </Table.Cell>
                    <Table.Cell>{user.type}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Root>
            </div>
          )}
        </SwrContent>
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default UserDetail;
