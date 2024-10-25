import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { latestAuthenticationContextVersion } from "@/contexts/AuthenticationContext";
import { UpdateAuthenticationContext } from "@/contexts/UpdateAuthenticationContext";
import { authenticate } from "@/utilities/authentication/openid-connect";
import {
  openIdConnectMicrosoftClientId,
  openIdConnectMicrosoftServer,
} from "@/utilities/constants";
import Link from "next/link";
import { useContext, useEffect, useRef, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { UserInfoResponse } from "openid-client";
import { useRouter } from "next/router";
import { UserRole } from "@/i18n/user-role-messages";
import { PasswordDerivedKey } from "@/utilities/crypto/PasswordDerivedKey";
import TeacherLongTermKeyPair from "@/utilities/crypto/TeacherLongTermKeyPair";

const getEmailFromClaims = (userInfo: UserInfoResponse): string | undefined =>
  // if the email is not verified, return undefined
  userInfo.email_verified === false
    ? undefined
    : // otherwise return the email (which may also be undefined)
      userInfo.email;

const getNameFromUserInfo = (userInfo: UserInfoResponse): string | undefined =>
  userInfo.preferred_username || userInfo.name;

const OpenIdConnectRedirect = () => {
  const router = useRouter();
  const authenticationStarted = useRef(false);
  const [authenticationFailed, setAuthenticationFailed] = useState(false);

  const updateAuthenticationContext = useContext(UpdateAuthenticationContext);

  useEffect(() => {
    // prevent multiple authentication attempts. usually this should not happen but it seems
    // that at least during development the component is sporadically re-rendered
    if (authenticationStarted.current) {
      return;
    }

    authenticationStarted.current = true;
    authenticate(openIdConnectMicrosoftServer, openIdConnectMicrosoftClientId)
      .then(async ({ idToken, userInfo, isStudent, redirectPath }) => {
        const email = getEmailFromClaims(userInfo);
        const name = getNameFromUserInfo(userInfo);

        if (!email || !name) {
          throw new Error(
            `Email or name not found in user info: ${JSON.stringify(userInfo)}`,
          );
        }

        if (isStudent) {
          // the (remaining) authentication logic for students is handled on the join session page
          // we do not need to authenticate against the collimator backend
          updateAuthenticationContext({
            version: latestAuthenticationContextVersion,
            idToken: idToken,
            authenticationToken: undefined,
            role: UserRole.student,
            email,
            name,
          });

          router.push(redirectPath);

          return;
        }
        // this is the cause of slightly increased risk of the student's identity being tracked
        // we connect to the collimator backend and authenticate directly
        // note that this is not necessary for the student login flow because the teacher signs in
        // students to the collimator backend

        // we authenticate against the collimator backend using the id token

        // from this we get
        // 1) an authentication token
        // 2) a role
        const authenticationToken =
          "implement authentication against the collimator backend";
        const role = UserRole.teacher;

        if (role !== UserRole.teacher) {
          // if we are not a teacher, we simply store the auth token and role
          updateAuthenticationContext({
            version: latestAuthenticationContextVersion,
            idToken: idToken,
            authenticationToken,
            role,
            email,
            name,
          });

          router.push(redirectPath);
          return;
        }
        // AND if the role is teacher
        // 3) the user specific salt
        // 4) the teacher's long term public key
        // 5) the encrypted teacher long term private key

        const salt = new Uint8Array(16);
        const passwordKey = await PasswordDerivedKey.derive(
          window.crypto.subtle,
          "password",
          salt,
        );

        // replace this once the backend is connected
        const tempTeacherKeyPair = await TeacherLongTermKeyPair.generate(
          window.crypto.subtle,
        );

        const [encryptedPrivateKey, publicKey] = await Promise.all([
          tempTeacherKeyPair.exportPrivateKey(passwordKey),
          tempTeacherKeyPair.exportPublicKey(),
        ]);

        const teacherKeyPair = await TeacherLongTermKeyPair.importKeyPair(
          window.crypto.subtle,
          encryptedPrivateKey,
          publicKey,
          passwordKey,
        );

        updateAuthenticationContext({
          version: latestAuthenticationContextVersion,
          idToken: idToken,
          authenticationToken,
          role,
          email,
          name,
          keyPair: teacherKeyPair,
        });

        router.push(redirectPath);
      })
      .catch((e) => {
        console.error("Authentication failed", e);
        setAuthenticationFailed(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header />
      <Container>
        {authenticationFailed ? (
          <>
            <PageHeader>
              <FormattedMessage
                id="OpenIdConnectRedirect.authenticationFailed"
                defaultMessage="Authentication failed"
              />
            </PageHeader>
            <Link href="/login">
              <FormattedMessage
                id="OpenIdConnectRedirect.retry"
                defaultMessage="Retry"
              />
            </Link>
          </>
        ) : (
          <>
            <PageHeader>
              <FormattedMessage
                id="OpenIdConnectRedirect.authenticating"
                defaultMessage="You are being authenticated..."
              />
            </PageHeader>
            <Spinner animation="border" role="status" />
          </>
        )}
      </Container>
    </>
  );
};

export default OpenIdConnectRedirect;
