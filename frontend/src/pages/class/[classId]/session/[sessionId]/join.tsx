import { useClass } from "@/api/collimator/hooks/classes/useClass";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import Button from "@/components/Button";
import Header from "@/components/Header";
import FullHeightRow from "@/components/layout/FullHeightRow";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import RemainingHeightContainer from "@/components/layout/RemainingHeightContainer";
import VerticalSpacing from "@/components/layout/VerticalSpacing";
import MultiSwrContent from "@/components/MultiSwrContent";
import TaskDescription from "@/components/TaskDescription";
import TaskList from "@/components/TaskList";
import {
  AuthenticationContext,
  isStudentAuthenticated,
  isStudentFullyAuthenticated,
  isStudentLocallyAuthenticated,
} from "@/contexts/AuthenticationContext";
import { UpdateAuthenticationContext } from "@/contexts/UpdateAuthenticationContext";
import StudentKeyPair from "@/utilities/crypto/StudentKeyPair";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect } from "react";
import { Col, Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

const SubHeader = styled.h2`
  margin-bottom: 1rem;
`;

const JoinSession = () => {
  const router = useRouter();
  const {
    classId,
    sessionId,
    key: teacherPublicKeyFingerprint,
  } = router.query as {
    classId?: string;
    sessionId?: string;
    key?: string;
  };

  const {
    data: klass,
    error: klassError,
    isLoading: isLoadingKlass,
  } = useClass(classId);

  const {
    data: session,
    error: sessionError,
    isLoading: isLoadingSession,
  } = useClassSession(classId, sessionId);

  const authenticationContext = useContext(AuthenticationContext);
  const updateAuthenticationContext = useContext(UpdateAuthenticationContext);

  // if the student is not locally authenticated (i.e. the id token was obtained), redirect to the login page
  useEffect(() => {
    // stop early if we do not have a session id
    if (!session) {
      return;
    }

    if (isStudentFullyAuthenticated(authenticationContext, session.id)) {
      return;
    }

    if (!isStudentLocallyAuthenticated(authenticationContext)) {
      router.push(
        `/login/student?classId=${session.klass.id}&sessionId=${session.id}&key=${teacherPublicKeyFingerprint}`,
      );
      return;
    }

    // when joining a session, we first generate an ephemeral asymmetric key pair
    StudentKeyPair.generate(window.crypto.subtle)
      .then(async (keyPair) => {
        // next, fetch the public key of the teacher using the fingerprint

        // then generate a shared secret using the teacher's public key and the student's private key (this also verifies the fingerprint)
        // this shared secret is then used to encrypt messages sent to the teacher during this session

        /**
         * finally send the public key to the teacher s.t. they can generate the shared secret first
         * also send along the id token to authenticate the student but encrypt it with the newly derived shared secret
         * if the id token is not authentic, the teacher can just ignore the message
         * however if the id token is authentic, the teacher can decrypt it and verify the student's identity
         * then the teacher determines a pseudonym for the student for this session and sends it back to the student
         * this allows students to re-join sessions from different devices because we are not relying on
         * the ephemeral public key generated when joining a session
         * for simplicity, we will use the encryption of the student's name + email under the teacher's long term private key as the pseudonym
         */

        /**
         * wait for a confirmation from the teacher that we are allowed to join the session
         * the teacher responds with a authentication token (encrypted with the shared secret)
         * this token is then used to authenticate the student against the server
         */

        // verify the shared secret by decrypting the confirmation message from the teacher

        // if the message can be decrypted, store the shared secret + the authentication token
        const authenticationToken = "retrieve from teacher";

        // if the message cannot be decrypted, the student is not allowed to join the session as someone is trying to impersonate the teacher
        updateAuthenticationContext({
          ...authenticationContext,
          keyPair,
          authenticationToken,
          sessionId: session.id,
        });
      })
      .catch((error) => {
        console.error("Failed to generate student key pair", error);
      });
  }, [
    authenticationContext,
    router,
    session,
    teacherPublicKeyFingerprint,
    updateAuthenticationContext,
  ]);

  const onJoinSession = useCallback(async () => {
    if (
      !klass ||
      !session ||
      session.tasks.length <= 0 ||
      !isStudentFullyAuthenticated(authenticationContext, session.id)
    ) {
      return;
    }

    // once this is done, the student is fully authenticated and can join the session
    router.push(
      `/class/${klass.id}/session/${session.id}/task/${session.tasks[0].id}/solve`,
    );
  }, [klass, session, authenticationContext, router]);

  if (!isStudentAuthenticated(authenticationContext) || !sessionId) {
    // the user will be redirected to the login page if the state does not match
    return null;
  }

  if (!teacherPublicKeyFingerprint) {
    return (
      <>
        <Header />
        <Container>
          <FormattedMessage
            id="JoinSession.invalidJoinLink"
            defaultMessage="This session link is invalid. Make sure you opened the correct one and otherwise ask your teacher to send it again."
          />
        </Container>
      </>
    );
  }

  return (
    <MaxScreenHeight>
      <Header />
      <VerticalSpacing />

      <RemainingHeightContainer>
        <MultiSwrContent
          data={[klass, session]}
          errors={[klassError, sessionError]}
          isLoading={[isLoadingKlass, isLoadingSession]}
        >
          {([klass, session]) => (
            <FullHeightRow>
              <Col xs={4}>
                <SubHeader>
                  <FormattedMessage
                    id="JoinSession.taskList"
                    defaultMessage="Tasks"
                  />
                </SubHeader>
                <TaskList classId={klass.id} session={session} />
              </Col>
              <Col xs={8}>
                <SubHeader>{session.title}</SubHeader>
                <TaskDescription>
                  <p>{session.description}</p>
                </TaskDescription>
                <Button onClick={onJoinSession}>
                  <FormattedMessage
                    id="JoinSession.joinSession"
                    defaultMessage="Join Session"
                  />
                </Button>
              </Col>
            </FullHeightRow>
          )}
        </MultiSwrContent>
      </RemainingHeightContainer>
      <VerticalSpacing />
    </MaxScreenHeight>
  );
};

export default JoinSession;
