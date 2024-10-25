import Button from "@/components/Button";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { WarningMessages } from "@/i18n/warning-messages";
import { redirectToOpenIdConnectProvider } from "@/utilities/authentication/openid-connect";
import {
  openIdConnectMicrosoftClientId,
  openIdConnectMicrosoftServer,
} from "@/utilities/constants";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { Container } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";

const LoginPage = () => {
  const router = useRouter();
  const intl = useIntl();
  const { redirectUri } = router.query as {
    redirectUri?: string;
  };

  const onAuthenticateWithMicrosoft = useCallback(() => {
    redirectToOpenIdConnectProvider(
      openIdConnectMicrosoftServer,
      openIdConnectMicrosoftClientId,
      // only redirect to the specified URI if it starts with a `/`
      // this is to prevent open redirects
      redirectUri?.startsWith(`/`) ? redirectUri : `/`,
      false,
    );
  }, [redirectUri]);

  return (
    <>
      <Header />
      <Container>
        <PageHeader>
          <FormattedMessage id="LoginPage.header" defaultMessage="Login" />
        </PageHeader>
        <p>{intl.formatMessage(WarningMessages.authenticationTracking)}</p>
        <Button onClick={onAuthenticateWithMicrosoft}>
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
