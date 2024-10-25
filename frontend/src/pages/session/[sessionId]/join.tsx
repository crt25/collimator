import Button from "@/components/Button";
import Header from "@/components/Header";
import FullHeightRow from "@/components/layout/FullHeightRow";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import RemainingHeightContainer from "@/components/layout/RemainingHeightContainer";
import VerticalSpacing from "@/components/layout/VerticalSpacing";
import TaskDescription from "@/components/TaskDescription";
import TaskList from "@/components/TaskList";
import {
  AuthenticationContext,
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
  const { sessionId: sessionIdString, key: teacherPublicKeyFingerprint } =
    router.query as {
      sessionId?: string;
      key?: string;
    };

  const sessionId =
    sessionIdString !== undefined && parseInt(sessionIdString, 10);

  const authenticationContext = useContext(AuthenticationContext);
  const updateAuthenticationContext = useContext(UpdateAuthenticationContext);

  // if the student is not locally authenticated (i.e. the id token was obtained), redirect to the login page
  useEffect(() => {
    if (
      !isStudentLocallyAuthenticated(authenticationContext) &&
      // the session id should always be there
      sessionId
    ) {
      router.push(
        `/login/student?sessionId=${sessionId}&key=${teacherPublicKeyFingerprint}`,
      );
    }
  }, [authenticationContext, router, sessionId, teacherPublicKeyFingerprint]);

  const onJoinSession = useCallback(async () => {
    if (!isStudentLocallyAuthenticated(authenticationContext)) {
      return;
    }
    // when joining a session, we first generate an ephemeral asymmetric key pair
    const keyPair = await StudentKeyPair.generate(window.crypto.subtle);

    // next, fetch the public key of the teacher using the fingerprint

    // then generate a shared secret using the teacher's public key and the student's private key (this also verifies the fingerprint)
    // this shared secret is then used to encrypt messages sent to the teacher during this session
    // note that by using the long term key directly for the derivation of the ephemeral key,
    // the teacher does not get a guarantee for perfect forward secrecy with respect to the collimator server
    // (this is different from e.g. TLS)
    // however, the teacher does not use the shared key to encrypt data that is confidential
    // the shared key is used to protect the students and, assuming they follow the protocol, get the guarantee for perfect forward secrecy

    // finally send the public key to the teacher s.t. they can generate the shared secret first
    // also send along the id token to authenticate the student but encrypt it with the newly derived shared secret
    // if the id token is not authentic, the teacher can just ignore the message
    // however if the id token is authentic, the teacher can decrypt it and verify the student's identity
    // then the teacher determines a pseudonym for the student for this session and sends it back to the student
    // this allows students to re-join sessions from different devices because we are not relying on
    // the ephemeral public key generated when joining a session
    // for simplicity, we will use the encryption of the student's name + email under the teacher's long term private key as the pseudonym
    // this way, the teacher always has the ability to decrypt the pseudonym and learn the student's identity
    // while towards others, the pseudonym is just a random string
    // the email is included in the pseudonym to ensure the pseudonym is unique even if two students share the same name

    // wait for a confirmation from the teacher that we are allowed to join the session
    // the teacher responds with a authentication token (encrypted with the shared secret)
    // this token is then used to authenticate the student against the server

    // verify the shared secret by decrypting the confirmation message from the teacher

    // if the message can be decrypted, store the shared secret + the authentication token
    const authenticationToken = "retrieve from teacher";

    // if the message cannot be decrypted, the student is not allowed to join the session as someone is trying to impersonate the teacher
    updateAuthenticationContext({
      ...authenticationContext,
      keyPair,
      authenticationToken,
    });

    // once this is done, the student is fully authenticated and can join the session
    // first, fetch the tasks for the session and then redirect to the first task
    router.push(`/session/${sessionId}/task/1`);
  }, [sessionId, authenticationContext, updateAuthenticationContext, router]);

  if (!isStudentLocallyAuthenticated(authenticationContext) || !sessionId) {
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
        <FullHeightRow>
          <Col xs={4}>
            <SubHeader>
              <FormattedMessage
                id="JoinSession.taskList"
                defaultMessage="Tasks"
              />
            </SubHeader>
            <TaskList sessionId={sessionId} />
          </Col>
          <Col xs={8}>
            <SubHeader>Introduction to Scratch</SubHeader>
            <TaskDescription>
              <p>
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                diam nonumy eirmod tempor invidunt ut labore et dolore magna
                aliquyam erat, sed diam voluptua. At vero eos et accusam et
                justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
                takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum
                dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
                sed diam voluptua. At vero eos et accusam et justo duo dolores
                et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus
                est Lorem ipsum dolor sit amet.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                diam nonumy eirmod tempor invidunt ut labore et dolore magna
                aliquyam erat, sed diam voluptua. At vero eos et accusam et
                justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
                takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum
                dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
                sed diam voluptua. At vero eos et accusam et justo duo dolores
                et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus
                est Lorem ipsum dolor sit amet.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                diam nonumy eirmod tempor invidunt ut labore et dolore magna
                aliquyam erat, sed diam voluptua. At vero eos et accusam et
                justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
                takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum
                dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
                sed diam voluptua. At vero eos et accusam et justo duo dolores
                et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus
                est Lorem ipsum dolor sit amet.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                diam nonumy eirmod tempor invidunt ut labore et dolore magna
                aliquyam erat, sed diam voluptua. At vero eos et accusam et
                justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
                takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum
                dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
                sed diam voluptua. At vero eos et accusam et justo duo dolores
                et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus
                est Lorem ipsum dolor sit ametx.
              </p>
            </TaskDescription>
            <Button onClick={onJoinSession}>
              <FormattedMessage
                id="JoinSession.joinSession"
                defaultMessage="Join Session"
              />
            </Button>
          </Col>
        </FullHeightRow>
      </RemainingHeightContainer>
      <VerticalSpacing />
    </MaxScreenHeight>
  );
};

export default JoinSession;
