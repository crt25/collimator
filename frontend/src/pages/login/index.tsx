import { useRouter } from "next/router";
import { useCallback } from "react";
import { defineMessages, FormattedMessage } from "react-intl";
import { Center, Container } from "@chakra-ui/react";
import Header from "@/components/Header";
import { redirectToOpenIdConnectProvider } from "@/utilities/authentication/openid-connect";
import PageHeading from "@/components/PageHeading";
import LoginCard from "@/components/login/LoginCard";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "LoginPage.title",
    defaultMessage: "Teacher Login",
  },
  header: {
    id: "LoginPage.header",
    defaultMessage: "Welcome to ClassMosaic!",
  },
  pageDescription: {
    id: "LoginPage.pageDescription",
    defaultMessage: "You're about to access the teacher portal.",
  },
  cardTitle: {
    id: "LoginPage.cardTitle",
    defaultMessage: "Teacher Login",
  },
  cardDescription: {
    id: "LoginPage.cardDescription",
    defaultMessage:
      "Log in to access your classes, tasks, and learning resources.",
  },
  authenticateMicrosoft: {
    id: "LoginPage.authenticate.microsoft",
    defaultMessage: "Authenticate using Microsoft",
  },
});

const LoginPage = () => {
  const router = useRouter();
  const { redirectUri, registrationToken } = router.query as {
    redirectUri?: string;
    registrationToken?: string;
  };

  const onAuthenticateWithMicrosoft = useCallback(() => {
    redirectToOpenIdConnectProvider(
      // only redirect to the specified URI if it starts with a `/`
      // this is to prevent open redirects
      redirectUri?.startsWith(`/`) ? redirectUri : `/`,
      registrationToken,
      false,
    );
  }, [redirectUri, registrationToken]);

  return (
    <MaxScreenHeight>
      <Header title={messages.title} hideSignIn />
      <Container>
        <PageHeading
          description={<FormattedMessage {...messages.pageDescription} />}
        >
          <FormattedMessage {...messages.header} />
        </PageHeading>
      </Container>
      <Center marginTop="xl">
        <LoginCard
          title={<FormattedMessage {...messages.cardTitle} />}
          description={<FormattedMessage {...messages.cardDescription} />}
          buttonLabel={<FormattedMessage {...messages.authenticateMicrosoft} />}
          onAuthenticate={onAuthenticateWithMicrosoft}
        />
      </Center>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default LoginPage;
