import { useRouter } from "next/router";
import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import { useCallback } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import SwrContent from "@/components/SwrContent";
import { useUpdateUser } from "@/api/collimator/hooks/users/useUpdateUser";
import { useUser } from "@/api/collimator/hooks/users/useUser";
import UserForm, { UserFormValues } from "@/components/user/UserForm";
import { AuthenticationProvider } from "@/api/collimator/generated/models";
import PageHeading from "@/components/PageHeading";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "EditUser.title",
    defaultMessage: "Edit User - {name}",
  },
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
          email: formValues.email,
          authenticationProvider: AuthenticationProvider.MICROSOFT,
          type: formValues.type,
        });

        router.back();
      }
    },
    [user, updateUser, router],
  );

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
          <CrtNavigation breadcrumb user={user} />
        </Breadcrumbs>
        <PageHeading>
          <FormattedMessage id="EditUser.header" defaultMessage="Edit User" />
        </PageHeading>
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
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default EditUser;
