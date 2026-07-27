import { useRouter } from "next/router";
import { useCallback } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Center, Container } from "@chakra-ui/react";
import Header from "@/components/header/Header";
import { toaster } from "@/components/Toaster";
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
  authenticationError: {
    id: "LoginPage.authenticate.error",
    defaultMessage:
      "Sign-in could not be started. Please check your connection and try again.",
  },
});

const LoginPage = () => {
  const router = useRouter();
  const { redirectUri, registrationToken } = router.query as {
    redirectUri?: string;
    registrationToken?: string;
  };

  const intl = useIntl();

  const onAuthenticateWithMicrosoft = useCallback(async () => {
    try {
      // on success this navigates away, so the promise only rejects when the
      // redirect could not be started (e.g. OIDC discovery failed)
      await redirectToOpenIdConnectProvider(
        // only redirect to the specified URI if it starts with a `/`
        // this is to prevent open redirects
        redirectUri?.startsWith(`/`) ? redirectUri : `/`,
        registrationToken,
        false,
      );
    } catch (error) {
      // without this the rejection is unhandled and the user sees nothing
      // happen after clicking the button
      console.error("[LoginPage] Could not start authentication", error);
      toaster.error({
        id: "login-authentication-error",
        title: intl.formatMessage(messages.authenticationError),
      });
    }
  }, [redirectUri, registrationToken, intl]);

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
          buttonDataTestId="signin-button"
        />
      </Center>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default LoginPage;
