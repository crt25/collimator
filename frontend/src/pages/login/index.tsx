import { useRouter } from "next/router";
import { useCallback } from "react";
import { defineMessages, FormattedMessage } from "react-intl";
import { AbsoluteCenter, Container } from "@chakra-ui/react";
import Header from "@/components/Header";
import PageHeading from "@/components/PageHeading";
import LoginCard from "@/components/login/LoginCard";
import { redirectToOpenIdConnectProvider } from "@/utilities/authentication/openid-connect";

const messages = defineMessages({
  title: {
    id: "LoginPage.title",
    defaultMessage: "Teacher Login",
  },
  header: {
    id: "LoginPage.header",
    defaultMessage: "Login",
  },
  description: {
    id: "LoginPage.description",
    defaultMessage: "Log in to access your account",
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
      <Header title={messages.title} />
      <Container>
        <PageHeading>
          <FormattedMessage {...messages.title} />
        </PageHeading>
        <PageHeading variant="description">
          <FormattedMessage {...messages.description} />
        </PageHeading>
      </Container>
      <AbsoluteCenter>
        <LoginCard
          title={<FormattedMessage {...messages.header} />}
          description={<FormattedMessage {...messages.description} />}
          buttonLabel={<FormattedMessage {...messages.authenticateMicrosoft} />}
          onAuthenticate={onAuthenticateWithMicrosoft}
        />
      </AbsoluteCenter>
    </>
  );
};

export default LoginPage;
