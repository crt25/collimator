import { useRouter } from "next/router";
import { useCallback } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { AbsoluteCenter, Card, Stack, Container } from "@chakra-ui/react";
import Button from "@/components/Button";
import Header from "@/components/Header";
import { WarningMessages } from "@/i18n/warning-messages";
import { redirectToOpenIdConnectProvider } from "@/utilities/authentication/openid-connect";
import { TextComponent as Text } from "@/components/Text";
import PageHeading from "@/components/PageHeading";

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
        <PageHeading>
          <FormattedMessage {...messages.title} />
        </PageHeading>
        <PageHeading variant="description">
          <FormattedMessage {...messages.description} />
        </PageHeading>
      </Container>
      <AbsoluteCenter>
        <Stack gap="sm" width="full" maxWidth="md">
          <Card.Root width="full">
            <Card.Header gap="sm">
              <Card.Title>
                <FormattedMessage {...messages.header} />
              </Card.Title>
              <Card.Description>
                <FormattedMessage {...messages.description} />
              </Card.Description>
              <Stack width="full">
                <Text fontSize="sm" color="gray.600">
                  {intl.formatMessage(WarningMessages.authenticationTracking)}
                </Text>
              </Stack>
            </Card.Header>
            <Card.Body />
            <Card.Footer justifyContent="flex-end">
              <Button
                onClick={onAuthenticateWithMicrosoft}
                data-testid="signin-button"
              >
                <FormattedMessage {...messages.authenticateMicrosoft} />
              </Button>
            </Card.Footer>
          </Card.Root>
        </Stack>
      </AbsoluteCenter>
    </>
  );
};

export default LoginPage;
