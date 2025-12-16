import { defineMessages } from "react-intl";
import { useCallback } from "react";
import { useRouter } from "next/router";
import CrtNavigation from "@/components/CrtNavigation";
import UserForm, { UserFormValues } from "@/components/user/UserForm";
import { useCreateUser } from "@/api/collimator/hooks/users/useCreateUser";
import { AuthenticationProvider } from "@/api/collimator/generated/models";
import PageLayout from "@/components/layout/Page";

const messages = defineMessages({
  title: {
    id: "CreateUser.title",
    defaultMessage: "Create User",
  },
  heading: {
    id: "CreateUser.header",
    defaultMessage: "Create User",
  },
  submit: {
    id: "CreateUser.submit",
    defaultMessage: "Create User",
  },
});

const CreateUser = () => {
  const router = useRouter();
  const createUser = useCreateUser();

  const onSubmit = useCallback(
    async (formValues: UserFormValues) => {
      await createUser({
        name: formValues.name,
        email: formValues.email,
        authenticationProvider: AuthenticationProvider.MICROSOFT,
        type: formValues.type,
      });

      router.back();
    },
    [createUser, router],
  );

  return (
    <PageLayout
      title={messages.title}
      heading={messages.heading}
      breadcrumbs={<CrtNavigation breadcrumb />}
    >
      <UserForm submitMessage={messages.submit} onSubmit={onSubmit} />
    </PageLayout>
  );
};

export default CreateUser;
