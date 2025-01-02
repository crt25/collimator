import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { latestAuthenticationContextVersion } from "@/contexts/AuthenticationContext";
import { UpdateAuthenticationContext } from "@/contexts/UpdateAuthenticationContext";
import { authenticate } from "@/utilities/authentication/openid-connect";
import Link from "next/link";
import { useContext, useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { UserInfoResponse } from "openid-client";
import { useRouter } from "next/router";
import ProgressSpinner from "@/components/ProgressSpinner";
import { UserRole } from "@/types/user/user-role";
import { useAuthenticateUser } from "@/api/collimator/hooks/authentication/useAuthenticateUser";
import {
  AuthenticationProvider,
  AuthenticationResponseDto,
} from "@/api/collimator/generated/models";
import { AuthenticationError } from "@/errors/authentication";
import UserSignIn from "@/components/authentication/UserSignIn";

const logModule = "[OpenIdConnectRedirect]";

const getNameFromUserInfo = (
  userInfo: UserInfoResponse,
): string | undefined => {
  let name = userInfo.name;

  if (!name) {
    const givenName = (userInfo.given_name ?? userInfo.givenname) as string;
    const familyName = (userInfo.family_name ?? userInfo.familyname) as string;

    if (givenName && familyName) {
      return `${givenName} ${familyName}`;
    }

    name = givenName ?? familyName ?? undefined;
  }

  return name;
};

const OpenIdConnectRedirect = () => {
  const router = useRouter();

  const authenticationStarted = useRef(false);
  const [authenticationFailed, setAuthenticationFailed] = useState(false);
  const [userSignInState, setUserSignInState] = useState<{
    idToken: string;
    redirectPath: string;
    authResponse: AuthenticationResponseDto;
  } | null>(null);
  const [errorRedirectPath, setErrorRedirectPath] = useState<string | null>(
    null,
  );

  const updateAuthenticationContext = useContext(UpdateAuthenticationContext);

  const authenticateUser = useAuthenticateUser();

  useEffect(() => {
    // prevent multiple authentication attempts. usually this should not happen but it seems
    // that at least during development the component is sporadically re-rendered
    if (authenticationStarted.current) {
      return;
    }

    authenticationStarted.current = true;

    authenticate()
      .then(
        async ({
          idToken,
          userInfo,
          isStudent,
          redirectPath,
          registrationToken,
        }) => {
          const name = getNameFromUserInfo(userInfo);

          if (!name) {
            throw new Error(
              `Name not found in user info: ${JSON.stringify(userInfo)}`,
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
              name,
            });

            await router.replace(redirectPath);
            return;
          }
          // this is the cause of slightly increased risk of the student's identity being tracked
          // we connect to the collimator backend and authenticate directly
          // note that this is not necessary for the student login flow because the teacher signs in
          // students to the collimator backend

          // we authenticate against the collimator backend using the id token
          const authResponse = await authenticateUser({
            authenticationProvider: AuthenticationProvider.MICROSOFT,
            idToken: idToken,
            registrationToken,
          });

          setUserSignInState({ authResponse, idToken, redirectPath });
        },
      )
      .catch((e) => {
        if (e instanceof AuthenticationError) {
          setErrorRedirectPath(e.redirectPath);
        }

        console.error(`${logModule} Authentication failed`, e);
        setAuthenticationFailed(true);
      });
    // we only want to run this once when the component is mounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authenticationFailed) {
    return (
      <>
        <Header />
        <Container>
          <PageHeader>
            <FormattedMessage
              id="OpenIdConnectRedirect.authenticationFailed"
              defaultMessage="Authentication failed"
            />
          </PageHeader>
          <Link href={errorRedirectPath ?? "/login"}>
            <FormattedMessage
              id="OpenIdConnectRedirect.retry"
              defaultMessage="Retry"
            />
          </Link>
        </Container>
      </>
    );
  }

  if (userSignInState !== null) {
    return (
      <>
        <Header />
        <Container>
          <PageHeader>
            <FormattedMessage
              id="OpenIdConnectRedirect.userSignInHeading"
              defaultMessage="User Sign In"
            />
          </PageHeader>
          <UserSignIn
            authResponse={userSignInState.authResponse}
            idToken={userSignInState.idToken}
            redirectPath={userSignInState.redirectPath}
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
            id="OpenIdConnectRedirect.authenticating"
            defaultMessage="You are being authenticated..."
          />
        </PageHeader>
        <ProgressSpinner />
      </Container>
    </>
  );
};

export default OpenIdConnectRedirect;
