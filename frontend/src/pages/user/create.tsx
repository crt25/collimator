import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import { useCallback } from "react";
import { useRouter } from "next/router";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/Header";
import UserForm, { UserFormValues } from "@/components/user/UserForm";
import { useCreateUser } from "@/api/collimator/hooks/users/useCreateUser";
import { AuthenticationProvider } from "@/api/collimator/generated/models";
import PageHeading from "@/components/PageHeading";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

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
    <MaxScreenHeight>
      <Header title={messages.title} />
      <Container>
        <CrtNavigation />
        <PageHeading>
          <FormattedMessage
            id="CreateUser.header"
            defaultMessage="Create User"
          />
        </PageHeading>
        <UserForm submitMessage={messages.submit} onSubmit={onSubmit} />
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default CreateUser;
