import { useRouter } from "next/router";
import { useCallback } from "react";
import { defineMessages, FormattedMessage } from "react-intl";
import { AbsoluteCenter, Container } from "@chakra-ui/react";
import Header from "@/components/Header";
import { redirectToOpenIdConnectProvider } from "@/utilities/authentication/openid-connect";
import PageHeading from "@/components/PageHeading";
import LoginCard from "@/components/login/LoginCard";

const messages = defineMessages({
  title: {
    id: "LoginPage.title",
    defaultMessage: "Teacher Login",
  },
  header: {
    id: "LoginPage.header",
    defaultMessage: "Teacher Login",
  },
  pageDescription: {
    id: "LoginPage.pageDescription",
    defaultMessage: "Welcome to the ClassMosaic Teacher Portal.",
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
    <>
      <Header title={messages.title} hideSignIn />
      <Container>
        <PageHeading>
          <FormattedMessage {...messages.header} />
        </PageHeading>
        <PageHeading variant="description">
          <FormattedMessage {...messages.pageDescription} />
        </PageHeading>
      </Container>
      <AbsoluteCenter>
        <LoginCard
          title={<FormattedMessage {...messages.cardTitle} />}
          description={<FormattedMessage {...messages.cardDescription} />}
          buttonLabel={<FormattedMessage {...messages.authenticateMicrosoft} />}
          onAuthenticate={onAuthenticateWithMicrosoft}
        />
      </AbsoluteCenter>
    </>
  );
};

export default LoginPage;
