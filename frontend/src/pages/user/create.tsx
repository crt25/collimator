import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import { useCallback } from "react";
import { useRouter } from "next/router";
import CrtNavigation from "@/components/CrtNavigation";
import PageHeader from "@/components/PageHeader";
import Header from "@/components/Header";
import UserForm, { UserFormValues } from "@/components/user/UserForm";
import { useCreateUser } from "@/api/collimator/hooks/users/useCreateUser";
import { AuthenticationProvider } from "@/api/collimator/generated/models";

const messages = defineMessages({
  title: {
    id: "CreateUser.title",
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
    <>
      <Header title={messages.title} />
      <Container>
        <CrtNavigation />
        <PageHeader>
          <FormattedMessage
            id="CreateUser.header"
            defaultMessage="Create User"
          />
        </PageHeader>
        <UserForm submitMessage={messages.submit} onSubmit={onSubmit} />
      </Container>
    </>
  );
};

export default CreateUser;
