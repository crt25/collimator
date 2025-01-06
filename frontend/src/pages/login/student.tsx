import { useRouter } from "next/router";
import { useCallback } from "react";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import Button from "@/components/Button";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { redirectToOpenIdConnectProvider } from "@/utilities/authentication/openid-connect";

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
        <Header />
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
      <Header />
      <Container>
        <PageHeader>
          <FormattedMessage
            id="StudentLoginPage.header"
            defaultMessage="Student Login"
          />
        </PageHeader>
        <Button
          onClick={onAuthenticateWithMicrosoft}
          data-testid="signin-student-button"
        >
          <FormattedMessage
            id="StudentLoginPage.authenticate.microsoft"
            defaultMessage="Authenticate using Microsoft"
          />
        </Button>
      </Container>
    </>
  );
};

export default StudentLoginPage;
