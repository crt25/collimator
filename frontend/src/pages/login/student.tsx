import { useRouter } from "next/router";
import { useCallback } from "react";
import { AbsoluteCenter, Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import Header from "@/components/Header";
import PageHeading from "@/components/PageHeading";
import { TextComponent as Text } from "@/components/Text";
import LoginCard from "@/components/login/LoginCard";
import { redirectToOpenIdConnectProvider } from "@/utilities/authentication/openid-connect";

const messages = defineMessages({
  title: {
    id: "StudentLoginPage.title",
    defaultMessage: "Please Authenticate to Register",
  },
  subtitle: {
    id: "StudentLoginPage.subtitle",
    defaultMessage: "Welcome on board.",
  },
});

const StudentLoginPage = () => {
  const router = useRouter();
  const {
    classId,
    sessionId,
    key: teacherPublicKeyFingerprint,
    registrationToken,
  } = router.query as {
    classId?: string;
    sessionId?: string;
    key?: string;
    registrationToken?: string;
  };

  const onAuthenticateWithMicrosoft = useCallback(() => {
    // we will be using the authorization code flow but with a public client
    // in order to avoid exposing the id token - IP / browser fingerprint
    // association to the collimator server
    // as this would allow the server to track students across sessions
    // on top, this prepares the application to be run in a desktop/mobile application
    // should the need arise

    redirectToOpenIdConnectProvider(
      `/class/${classId}/session/${sessionId}/join?key=${teacherPublicKeyFingerprint}`,
      registrationToken,
      true,
    );
  }, [classId, sessionId, teacherPublicKeyFingerprint, registrationToken]);

  if (!classId || !sessionId || !teacherPublicKeyFingerprint) {
    return (
      <>
        <Header title={messages.title} />
        <Container>
          <FormattedMessage
            id="StudentLoginPage.invalidParameters"
            defaultMessage="You can only log in as a student in order to join a session. Please open the link you received from your teacher."
          />
        </Container>
      </>
    );
  }

  return (
    <>
      <Header title={messages.title} hideSignIn />
      <Container>
        <PageHeading>
          <FormattedMessage {...messages.title} />
        </PageHeading>
        <Text fontSize="lg" color="gray.600" marginBottom="4">
          <FormattedMessage {...messages.subtitle} />
        </Text>
      </Container>

      <AbsoluteCenter>
        <LoginCard
          title={
            <FormattedMessage
              id="StudentLoginPage.cardTitle"
              defaultMessage="Student Login"
            />
          }
          description={
            <FormattedMessage
              id="StudentLoginPage.cardDescription"
              defaultMessage="Log in to access your account"
            />
          }
          buttonLabel={
            <FormattedMessage
              id="StudentLoginPage.authenticate.microsoft"
              defaultMessage="Authenticate using Microsoft"
            />
          }
          onAuthenticate={onAuthenticateWithMicrosoft}
          isStudent
        />
      </AbsoluteCenter>
    </>
  );
};

export default StudentLoginPage;
