import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import { useCallback } from "react";
import SwrContent from "@/components/SwrContent";
import { useUpdateUser } from "@/api/collimator/hooks/users/useUpdateUser";
import { useUser } from "@/api/collimator/hooks/users/useUser";
import UserForm, { UserFormValues } from "@/components/user/UserForm";
import { AuthenticationProvider } from "@/api/collimator/generated/models";

const messages = defineMessages({
  submit: {
    id: "EditUser.submit",
    defaultMessage: "Save User",
  },
});

const EditUser = () => {
  const router = useRouter();
  const { userId } = router.query as {
    userId: string;
  };

  const { data: user, error, isLoading } = useUser(userId);

  const updateUser = useUpdateUser();

  const onSubmit = useCallback(
    async (formValues: UserFormValues) => {
      if (user) {
        await updateUser(user.id, {
          name: formValues.name,
          oidcSub: formValues.openIdConnectSub,
          authenticationProvider: AuthenticationProvider.MICROSOFT,
          type: formValues.type,
        });

        router.back();
      }
    },
    [user, updateUser, router],
  );

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb user={user} />
        </Breadcrumbs>
        <PageHeader>
          <FormattedMessage id="EditUser.header" defaultMessage="Edit User" />
        </PageHeader>
        <SwrContent error={error} isLoading={isLoading} data={user}>
          {(user) => (
            <UserForm
              submitMessage={messages.submit}
              initialValues={user}
              onSubmit={onSubmit}
            />
          )}
        </SwrContent>
      </Container>
    </>
  );
};

export default EditUser;
