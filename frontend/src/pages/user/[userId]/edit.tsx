import { useRouter } from "next/router";
import { defineMessages } from "react-intl";
import { useCallback } from "react";
import CrtNavigation from "@/components/CrtNavigation";
import SwrContent from "@/components/SwrContent";
import { useUpdateUser } from "@/api/collimator/hooks/users/useUpdateUser";
import { useUser } from "@/api/collimator/hooks/users/useUser";
import UserForm, { UserFormValues } from "@/components/user/UserForm";
import { AuthenticationProvider } from "@/api/collimator/generated/models";
import PageLayout from "@/components/layout/Page";

const messages = defineMessages({
  title: {
    id: "EditUser.title",
    defaultMessage: "Edit User",
  },
  heading: {
    id: "EditUser.header",
    defaultMessage: "Edit User",
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
    <PageLayout
      title={messages.title}
      heading={messages.heading}
      breadcrumbs={<CrtNavigation breadcrumb user={user} />}
    >
      <SwrContent error={error} isLoading={isLoading} data={user}>
        {(user) => (
          <UserForm
            submitMessage={messages.submit}
            initialValues={user}
            onSubmit={onSubmit}
          />
        )}
      </SwrContent>
    </PageLayout>
  );
};

export default EditUser;
