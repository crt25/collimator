import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useRef } from "react";
import { Col, Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import { fetchPublicKey } from "@/api/collimator/hooks/authentication/usePublicKey";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { useIsSessionAnonymous } from "@/api/collimator/hooks/sessions/useIsSessionAnonymous";
import Button from "@/components/Button";
import Header from "@/components/Header";
import FullHeightRow from "@/components/layout/FullHeightRow";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import RemainingHeightContainer from "@/components/layout/RemainingHeightContainer";
import VerticalSpacing from "@/components/layout/VerticalSpacing";
import MultiSwrContent from "@/components/MultiSwrContent";
import ProgressSpinner from "@/components/ProgressSpinner";
import TaskDescription from "@/components/TaskDescription";
import TaskList from "@/components/TaskList";
import {
  AuthenticationContext,
  isStudentAuthenticated,
  isStudentFullyAuthenticated,
  isStudentLocallyAuthenticated,
  latestAuthenticationContextVersion,
  StudentAuthenticatedAnonymous,
  StudentLocallyAuthenticated,
} from "@/contexts/AuthenticationContext";
import { UpdateAuthenticationContext } from "@/contexts/UpdateAuthenticationContext";
import { WebSocketContext } from "@/contexts/WebSocketProvider";
import { UserRole } from "@/types/user/user-role";
import { StudentAuthenticationRequestContent } from "@/types/websocket-events";
import { decodeBase64, encodeBase64 } from "@/utilities/crypto/base64";
import StudentKeyPair from "@/utilities/crypto/StudentKeyPair";
import { useAuthenticateAnonymousStudent } from "@/api/collimator/hooks/authentication/useAuthenticateAnonymousStudent";

const logModule = "[JoinSession]";

const messages = defineMessages({
  title: {
    id: "JoinSession.title",
    defaultMessage: "Join Session",
  },
  choosePseudonym: {
    id: "JoinSession.choosePseudonym",
    defaultMessage: "Enter a pseudonym",
  },
  savePseudonym: {
    id: "JoinSession.savePseudonym",
    defaultMessage: "Confirm",
  },
});

const SubHeader = styled.h2`
  margin-bottom: 1rem;
`;

const JoinSessionContent = ({
  classId,
  sessionId,
}: {
  classId: number;
  sessionId: number;
}) => {
  const authenticationContext = useContext(AuthenticationContext);
  const router = useRouter();

  const {
    data: session,
    error: sessionError,
    isLoading: isLoadingSession,
  } = useClassSession(classId, sessionId);

  const onJoinSession = useCallback(async () => {
    if (
      !classId ||
      !session ||
      session.tasks.length <= 0 ||
      !isStudentFullyAuthenticated(authenticationContext, session.id)
    ) {
      return;
    }

    // once this is done, the student is fully authenticated and can join the session
    router.replace(
      `/class/${classId}/session/${session.id}/task/${session.tasks[0].id}/solve`,
    );
  }, [classId, session, authenticationContext, router]);

  return (
    <MultiSwrContent
      data={[session]}
      errors={[sessionError]}
      isLoading={[isLoadingSession]}
    >
      {([session]) => (
        <FullHeightRow>
          <Col xs={4}>
            <SubHeader>
              <FormattedMessage
                id="JoinSession.taskList"
                defaultMessage="Tasks"
              />
            </SubHeader>
            <TaskList classId={classId} session={session} />
          </Col>
          <Col xs={8}>
            <SubHeader>{session.title}</SubHeader>
            <TaskDescription>
              <p>{session.description}</p>
            </TaskDescription>
            <Button onClick={onJoinSession} data-testid="join-session-button">
              <FormattedMessage
                id="JoinSession.joinSession"
                defaultMessage="Join Session"
              />
            </Button>
          </Col>
        </FullHeightRow>
      )}
    </MultiSwrContent>
  );
};

const JoinSession = () => {
  const router = useRouter();
  const {
    classId: classIdString,
    sessionId: sessionIdString,
    key: teacherPublicKeyFingerprint,
  } = router.query as {
    classId?: string;
    sessionId?: string;
    key?: string;
  };

  const classId = parseInt(classIdString ?? "no id", 10);
  const sessionId = parseInt(sessionIdString ?? "no id", 10);

  const { data: isSessionAnonymous } = useIsSessionAnonymous(
    classId,
    sessionId,
  );

  const authenticationContext = useContext(AuthenticationContext);
  const updateAuthenticationContext = useContext(UpdateAuthenticationContext);
  const authenticateAnonymousStudent = useAuthenticateAnonymousStudent();
  const websocketContext = useContext(WebSocketContext);
  const isAuthenticating = useRef(false);

  // if the student is not locally authenticated (i.e. the id token was obtained), redirect to the login page
  useEffect(() => {
    if (
      // stop early if we do not have a session id, a teacher public key fingerprint or a websocket context
      isNaN(classId) ||
      isNaN(sessionId) ||
      !teacherPublicKeyFingerprint ||
      // if we do not know whether the session is anonymous, we cannot proceed
      isSessionAnonymous === undefined
    ) {
      return;
    }

    if (isStudentFullyAuthenticated(authenticationContext, sessionId)) {
      return;
    }

    // the student context is either null (anonymous) or locally authenticated
    let studentContext: StudentLocallyAuthenticated | null;

    if (isSessionAnonymous) {
      studentContext = null;
    } else if (isStudentLocallyAuthenticated(authenticationContext)) {
      studentContext = authenticationContext;
    } else {
      router.replace(
        `/login/student?classId=${classId}&sessionId=${sessionId}&key=${teacherPublicKeyFingerprint}`,
      );
      return;
    }

    if (!websocketContext) {
      return;
    }

    if (isAuthenticating.current) {
      return;
    }

    isAuthenticating.current = true;

    // when joining a session, we first generate an ephemeral asymmetric key pair
    StudentKeyPair.generate(window.crypto.subtle)
      .then(async (keyPair) => {
        // next, fetch the public key of the teacher using the fingerprint
        const { publicKey: teacherPublicKey, teacherId } = await fetchPublicKey(
          teacherPublicKeyFingerprint,
        );

        if (studentContext === null) {
          const authenticationResponse = await authenticateAnonymousStudent({
            classId,
            sessionId,
          });

          updateAuthenticationContext({
            version: latestAuthenticationContextVersion,
            role: UserRole.student,
            keyPair,
            authenticationToken: authenticationResponse.authenticationToken,
            sessionId: sessionId,
            teacherPublicKey,
            isAnonymous: true,
            idToken: undefined,
            name: undefined,
            ephemeralKey: undefined,
          } satisfies StudentAuthenticatedAnonymous);
        } else {
          // then generate a shared secret using the teacher's public key and the student's private key (this also verifies the fingerprint)
          // this shared secret is then used to encrypt messages sent to the teacher during this session

          const ephemeralKey = await keyPair.deriveSharedEphemeralKey(
            teacherPublicKey,
            teacherPublicKeyFingerprint,
          );

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

          let intervalId: NodeJS.Timeout | null = null;

          /**
           * wait for a confirmation from the teacher that we are allowed to join the session
           * the teacher responds with a authentication token (encrypted with the shared secret)
           * this token is then used to authenticate the student against the server
           */

          websocketContext.socket.once(
            "studentAuthenticationToken",
            async (data) => {
              // stop sending requests to the teacher
              if (intervalId) {
                clearInterval(intervalId);
              }

              // verify the shared secret by decrypting the confirmation message from the teacher
              // if the message can be decrypted, store the shared secret + the authentication token
              // if the message cannot be decrypted, the student is not allowed to join the session as someone is trying to impersonate the teacher
              const authenticationToken = await ephemeralKey.decryptString(
                decodeBase64(data.authenticationToken),
              );

              updateAuthenticationContext({
                ...studentContext,
                keyPair,
                authenticationToken,
                sessionId: sessionId,
                teacherPublicKey,
                ephemeralKey,
              });

              isAuthenticating.current = false;
            },
          );

          const sendRequest = async () => {
            websocketContext.socket.emit("requestTeacherToSignInStudent", {
              teacherId,
              studentPublicKey: JSON.stringify(await keyPair.exportPublicKey()),
              encryptedAuthenticationRequest: encodeBase64(
                await ephemeralKey.encryptString(
                  JSON.stringify({
                    classId,
                    idToken: studentContext.idToken,
                  } satisfies StudentAuthenticationRequestContent),
                ),
              ),
            });
          };

          // send the first request to the teacher
          sendRequest();

          // then repeatedly send the request to the teacher until we receive a response
          intervalId = setInterval(sendRequest, 5 * 1000);
        }
      })
      .catch((error) => {
        console.error(
          `${logModule} Failed to generate student key pair`,
          error,
        );
      });
  }, [
    authenticationContext,
    websocketContext,
    router,
    classId,
    sessionId,
    teacherPublicKeyFingerprint,
    authenticateAnonymousStudent,
    updateAuthenticationContext,
    isSessionAnonymous,
  ]);

  if (isSessionAnonymous === undefined) {
    // as long as we do not know whether the session is anonymous, show a loading spinner
    // then, when we know that the session is anonymous, show a form to enter a pseudonym
    return (
      <>
        <Header title={messages.title} />
        <Container>
          <ProgressSpinner />
        </Container>
      </>
    );
  }

  if (!isStudentAuthenticated(authenticationContext) || !sessionId) {
    // the user will be redirected to the login page if the state does not match
    return null;
  }

  if (!teacherPublicKeyFingerprint) {
    return (
      <>
        <Header title={messages.title} />
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
      <Header title={messages.title} />
      <VerticalSpacing />

      <RemainingHeightContainer>
        {isStudentFullyAuthenticated(authenticationContext, sessionId) ? (
          <JoinSessionContent classId={classId} sessionId={sessionId} />
        ) : (
          <>
            <FormattedMessage
              id="JoinSession.waitingForTeacher"
              defaultMessage="Waiting for the teacher's machine to admit you to the session..."
              description="Displayed when the student is waiting for the teacher's machine to admit them to the session"
            />
            <ProgressSpinner />
          </>
        )}
      </RemainingHeightContainer>
      <VerticalSpacing />
    </MaxScreenHeight>
  );
};

export default JoinSession;
