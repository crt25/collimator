import { useRouter } from "next/router";
import { defineMessages, useIntl } from "react-intl";
import { Container } from "@chakra-ui/react";
import { useCallback } from "react";
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
import { AuthenticationProvider } from "@/api/collimator/generated/models";
import { useUpdateUser } from "@/api/collimator/hooks/users/useUpdateUser";
import UserForm, { UserFormValues } from "@/components/user/UserForm";
import { toaster } from "@/components/Toaster";

const messages = defineMessages({
  title: {
    id: "UserDetail.title",
    defaultMessage: "User - {name}",
  },
  submit: {
    id: "UserDetail.submit",
    defaultMessage: "Save User",
  },
  successMessage: {
    id: "UserDetail.successMessage",
    defaultMessage: "Successfully saved changes",
  },
  errorMessage: {
    id: "UserDetail.errorMessage",
    defaultMessage:
      "There was an error saving the changes. Please try to save again!",
  },
});

const UserDetail = () => {
  const router = useRouter();
  const intl = useIntl();
  const { userId } = router.query as {
    userId: string;
  };

  const { data: user, isLoading, error } = useUser(userId);

  const updateUser = useUpdateUser();

  const onSubmit = useCallback(
    async (formValues: UserFormValues) => {
      if (!user) {
        return;
      }

      try {
        await updateUser(user.id, {
          name: formValues.name,
          email: formValues.email,
          authenticationProvider: AuthenticationProvider.MICROSOFT,
          type: formValues.type,
        });

        toaster.success({
          title: intl.formatMessage(messages.successMessage),
        });
      } catch (e) {
        console.error("Failed to update user:", e);
        toaster.error({
          title: intl.formatMessage(messages.errorMessage),
        });
      }
    },
    [user, updateUser, intl],
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
          <CrtNavigation breadcrumb />
        </Breadcrumbs>
        <SwrContent error={error} isLoading={isLoading} data={user}>
          {(user) => (
            <div>
              <PageHeading actions={<UserActions user={user} />}>
                {user.name ?? user.oidcSub}
              </PageHeading>
              <UserNavigation userId={user?.id} />
              <UserForm
                submitMessage={messages.submit}
                initialValues={user}
                onSubmit={onSubmit}
              />
            </div>
          )}
        </SwrContent>
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default UserDetail;
