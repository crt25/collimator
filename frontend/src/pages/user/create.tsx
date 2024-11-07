import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import { useCallback } from "react";
import { useRouter } from "next/router";
import UserForm, { UserFormValues } from "@/components/user/UserForm";
import { useCreateUser } from "@/api/collimator/hooks/users/useCreateUser";

const messages = defineMessages({
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
        type: formValues.type,
      });

      router.back();
    },
    [createUser, router],
  );

  return (
    <>
      <Header />
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
