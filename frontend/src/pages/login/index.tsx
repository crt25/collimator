import { useRouter } from "next/router";
import { useCallback } from "react";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import Button from "@/components/Button";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { WarningMessages } from "@/i18n/warning-messages";
import { redirectToOpenIdConnectProvider } from "@/utilities/authentication/openid-connect";

const messages = defineMessages({
  title: {
    id: "LoginPage.title",
    defaultMessage: "Teacher Login",
  },
});

const LoginPage = () => {
  const router = useRouter();
  const intl = useIntl();
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
        <PageHeader>
          <FormattedMessage id="LoginPage.header" defaultMessage="Login" />
        </PageHeader>
        <p>{intl.formatMessage(WarningMessages.authenticationTracking)}</p>
        <Button
          onClick={onAuthenticateWithMicrosoft}
          data-testid="signin-button"
        >
          <FormattedMessage
            id="LoginPage.authenticate.microsoft"
            defaultMessage="Authenticate using Microsoft"
          />
        </Button>
      </Container>
    </>
  );
};

export default LoginPage;
