import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { latestAuthenticationContextVersion } from "@/contexts/AuthenticationContext";
import { UpdateAuthenticationContext } from "@/contexts/UpdateAuthenticationContext";
import { authenticate } from "@/utilities/authentication/openid-connect";
import Link from "next/link";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { UserInfoResponse } from "openid-client";
import { useRouter } from "next/router";
import { PasswordDerivedKey } from "@/utilities/crypto/PasswordDerivedKey";
import TeacherLongTermKeyPair from "@/utilities/crypto/TeacherLongTermKeyPair";
import ProgressSpinner from "@/components/ProgressSpinner";
import { UserRole } from "@/types/user/user-role";
import { useAuthenticateUser } from "@/api/collimator/hooks/authentication/useAuthenticateUser";
import {
  AuthenticationProvider,
  AuthenticationResponseDto,
  UserType,
} from "@/api/collimator/generated/models";
import { decodeBase64, encodeBase64 } from "@/utilities/crypto/base64";
import UserSignInForm, {
  UserSignInFormValues,
} from "@/components/authentication/UserSignInForm";
import { UseFormSetError } from "react-hook-form";
import { useUpdateUserKey } from "@/api/collimator/hooks/users/useUpdateUserKey";
import { AuthenticationError } from "@/errors/authentication";

class DecryptionError extends Error {
  constructor() {
    super("Decryption failed");
  }
}

class NoBockupPasswordError extends Error {
  constructor() {
    super("No backup password provided");
  }
}

const messages = defineMessages({
  submit: {
    id: "OpenIdConnectRedirect.signInForm.submit",
    defaultMessage: "Sign In",
  },
  backupPasswordRequired: {
    id: "OpenIdConnectRedirect.signInForm.backupPasswordRequired",
    defaultMessage: "A backup password is required",
  },
  decryptionFailed: {
    id: "OpenIdConnectRedirect.signInForm.decryptionFailed",
    defaultMessage: "Decryption failed, try a different password.",
  },
  unknownError: {
    id: "OpenIdConnectRedirect.signInForm.unknownError",
    defaultMessage: "An unknown error occurred",
  },
});

const getEmailFromClaims = (userInfo: UserInfoResponse): string | undefined =>
  // if the email is not verified, return undefined
  // otherwise, return the email (which may also be undefined)
  userInfo.email_verified === false ? undefined : userInfo.email;

const getNameFromUserInfo = (userInfo: UserInfoResponse): string | undefined =>
  userInfo.preferred_username || userInfo.name;

const OpenIdConnectRedirect = () => {
  const router = useRouter();
  const intl = useIntl();
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
  const updateUserKey = useUpdateUserKey();

  useEffect(() => {
    // prevent multiple authentication attempts. usually this should not happen but it seems
    // that at least during development the component is sporadically re-rendered
    if (authenticationStarted.current) {
      return;
    }

    authenticationStarted.current = true;

    authenticate()
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

          await router.replace(redirectPath);
          return;
        }
        // this is the cause of slightly increased risk of the student's identity being tracked
        // we connect to the collimator backend and authenticate directly
        // note that this is not necessary for the student login flow because the teacher signs in
        // students to the collimator backend

        // we authenticate against the collimator backend using the id token
        const authResponse = await authenticateUser({
          authenticationProvider: AuthenticationProvider.microsoft,
          idToken: idToken,
        });

        setUserSignInState({ authResponse, idToken, redirectPath });
      })
      .catch((e) => {
        if (e instanceof AuthenticationError) {
          setErrorRedirectPath(e.redirectPath);
        }

        console.error("Authentication failed", e);
        setAuthenticationFailed(true);
      });
    // we only want to run this once when the component is mounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryUserSignIn = useCallback(
    async (
      idToken: string,
      redirectPath: string,
      authResponse: AuthenticationResponseDto,
      userProvidedPassword: string,
      userProvidedBackupPassword?: string,
    ) => {
      const {
        id: userId,
        name: userName,
        email: userEmail,
        authenticationToken,
        keyPair,
        type,
      } = authResponse;

      if (
        authResponse.type !== UserType.ADMIN &&
        authResponse.type !== UserType.TEACHER
      ) {
        throw new Error(`Unsupported user type: ${authResponse.type}`);
      }

      const crypto = window.crypto.subtle;
      let teacherKeyPair: TeacherLongTermKeyPair;
      let keyPairId: number;

      if (keyPair === null) {
        if (!userProvidedBackupPassword) {
          throw new NoBockupPasswordError();
        }

        // this is the first time the teacher is logging in, create a new key pair

        teacherKeyPair = await TeacherLongTermKeyPair.generate(
          window.crypto.subtle,
        );

        const salt1 = PasswordDerivedKey.generateSalt();
        const pwKey1 = await PasswordDerivedKey.derive(
          crypto,
          userProvidedPassword,
          salt1,
        );

        const salt2 = PasswordDerivedKey.generateSalt();
        const pwKey2 = await PasswordDerivedKey.derive(
          crypto,
          userProvidedBackupPassword,
          salt2,
        );

        const privateKey1 = await teacherKeyPair.exportPrivateKey(pwKey1);
        const privateKey2 = await teacherKeyPair.exportPrivateKey(pwKey2);

        const publicKey = await teacherKeyPair.exportPublicKey();
        const saltPublicKey = await teacherKeyPair.exportSaltPublicKey();
        const fingerprint = await teacherKeyPair.getPublicKeyFingerprint();

        keyPairId = await updateUserKey(
          userId,
          {
            key: {
              publicKey: JSON.stringify(publicKey),
              publicKeyFingerprint: fingerprint,
              salt: encodeBase64(
                new TextEncoder().encode(JSON.stringify(saltPublicKey)),
              ),
              privateKeys: [
                {
                  salt: encodeBase64(salt1),
                  encryptedPrivateKey: encodeBase64(privateKey1),
                },
                {
                  salt: encodeBase64(salt2),
                  encryptedPrivateKey: encodeBase64(privateKey2),
                },
              ],
            },
          },
          // explicitly set the authentication token because in the local application state
          // the user is not authenticated yet
          authenticationToken,
        );
      } else {
        // the teacher has logged in before, decrypt the private key
        const { publicKey: publicKeyString, salt, privateKeys } = keyPair;
        const publicKey = JSON.parse(publicKeyString);
        const saltPublicKey = JSON.parse(
          new TextDecoder().decode(decodeBase64(salt)),
        );

        // try to decrypt all private keys with the password
        const maybeDecryptedPrivateKeys = await Promise.all(
          privateKeys.map(async ({ salt, encryptedPrivateKey }) => {
            const passwordKey = await PasswordDerivedKey.derive(
              crypto,
              userProvidedPassword,
              decodeBase64(salt),
            );

            try {
              const key = await TeacherLongTermKeyPair.importKeyPair(
                crypto,
                decodeBase64(encryptedPrivateKey),
                publicKey,
                saltPublicKey,
                passwordKey,
              );

              return key;
            } catch {
              // decryption failed - most likely due to an incorrect password
              return null;
            }
          }),
        );

        // find the first key that was successfully decrypted
        const decryptedKeyPair = maybeDecryptedPrivateKeys.find(
          (key) => key !== null,
        );

        if (!decryptedKeyPair) {
          throw new DecryptionError();
        }

        teacherKeyPair = decryptedKeyPair;
        keyPairId = keyPair.id;
      }

      updateAuthenticationContext({
        version: latestAuthenticationContextVersion,
        idToken: idToken,
        authenticationToken,
        userId,
        role: type === UserType.ADMIN ? UserRole.admin : UserRole.teacher,
        email: userEmail,
        name: userName || userEmail,
        keyPair: teacherKeyPair,
        keyPairId,
      });

      await router.replace(redirectPath);
    },
    [router, updateAuthenticationContext, updateUserKey],
  );

  const onSubmitSignInForm = useCallback(
    (
      data: UserSignInFormValues,
      setError: UseFormSetError<UserSignInFormValues>,
    ) => {
      if (!userSignInState) {
        console.error(
          "User sign in state not set when submitting the user sign-in form",
        );

        setError("password", {
          type: "custom",
          message: intl.formatMessage(messages.unknownError),
        });

        return;
      }

      tryUserSignIn(
        userSignInState.idToken,
        userSignInState.redirectPath,
        userSignInState.authResponse,
        data.password,
        data.backupPassword,
      ).catch((e) => {
        if (e instanceof DecryptionError) {
          setError("password", {
            type: "custom",
            message: intl.formatMessage(messages.decryptionFailed),
          });
        } else if (e instanceof NoBockupPasswordError) {
          setError("backupPassword", {
            type: "custom",
            message: intl.formatMessage(messages.backupPasswordRequired),
          });
        } else {
          console.error("Error during user sign in", e);

          setError("password", {
            type: "custom",
            message: intl.formatMessage(messages.unknownError),
          });
        }
      });
    },
    [intl, tryUserSignIn, userSignInState],
  );

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
          <p>
            {userSignInState.authResponse.keyPair ? (
              <FormattedMessage
                id="OpenIdConnectRedirect.userSignInDescription"
                defaultMessage="The student identities are encrypted with the key that only you have access to. Please enter that password to sign in."
              />
            ) : (
              <FormattedMessage
                id="OpenIdConnectRedirect.userFirstTimeSignInDescription"
                defaultMessage="The student identities will be encrypted with a key that only you have access to. Please enter a password to protected the key. On top, enter a second, backup password and make sure you remember at least one of those two. Otherwise you will lose access to the student identities."
              />
            )}
          </p>
          <UserSignInForm
            submitMessage={messages.submit}
            onSubmit={onSubmitSignInForm}
            showBackupPassword={userSignInState.authResponse.keyPair === null}
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
