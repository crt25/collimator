import { useRouter } from "next/router";
import { useCallback } from "react";
import { Center, Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import Header from "@/components/header/Header";
import PageHeading from "@/components/PageHeading";
import LoginCard from "@/components/login/LoginCard";
import { redirectToOpenIdConnectProvider } from "@/utilities/authentication/openid-connect";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "StudentLoginPage.title",
    defaultMessage: "Student Login",
  },
  header: {
    id: "StudentLoginPage.header",
    defaultMessage: "Welcome to ClassMosaic!",
  },
  subtitle: {
    id: "StudentLoginPage.subtitle",
    defaultMessage: "You're about to join your lesson as a student.",
  },
  invalidParameters: {
    id: "StudentLoginPage.invalidParameters",
    defaultMessage:
      "The link you followed is invalid. You can only log in as a student to join a lesson. " +
      "Please open the link given you received from your teacher.",
  },
  cardTitle: {
    id: "StudentLoginPage.cardTitle",
    defaultMessage: "Student Login",
  },
  cardDescription: {
    id: "StudentLoginPage.cardDescription",
    defaultMessage: "Please authenticate below to access your lesson.",
  },
  authenticateMicrosoft: {
    id: "StudentLoginPage.authenticate.microsoft",
    defaultMessage: "Authenticate using Microsoft",
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
        <Header title={messages.title} hideSignIn />
        <Container>
          <FormattedMessage {...messages.invalidParameters} />
        </Container>
      </>
    );
  }

  return (
    <MaxScreenHeight>
      <Header title={messages.title} hideSignIn />
      <Container>
        <PageHeading description={<FormattedMessage {...messages.subtitle} />}>
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

export default StudentLoginPage;
