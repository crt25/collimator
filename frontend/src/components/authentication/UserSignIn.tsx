import {
  AuthenticationResponseDto,
  UserType,
} from "@/api/collimator/generated/models";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import UserSignInForm, { UserSignInFormValues } from "./UserSignInForm";
import { useCallback, useContext } from "react";
import { useUpdateUserKey } from "@/api/collimator/hooks/users/useUpdateUserKey";
import TeacherLongTermKeyPair from "@/utilities/crypto/TeacherLongTermKeyPair";
import { PasswordDerivedKey } from "@/utilities/crypto/PasswordDerivedKey";
import { decodeBase64, encodeBase64 } from "@/utilities/crypto/base64";
import { useRouter } from "next/router";
import { UpdateAuthenticationContext } from "@/contexts/UpdateAuthenticationContext";
import { latestAuthenticationContextVersion } from "@/contexts/AuthenticationContext";
import { UserRole } from "@/types/user/user-role";
import { UseFormSetError } from "react-hook-form";

const messages = defineMessages({
  submit: {
    id: "UserSignIn.submit",
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

const UserSignIn = ({
  idToken,
  redirectPath,
  authResponse,
}: {
  idToken: string;
  redirectPath: string;
  authResponse: AuthenticationResponseDto;
}) => {
  const intl = useIntl();
  const router = useRouter();
  const updateUserKey = useUpdateUserKey();
  const updateAuthenticationContext = useContext(UpdateAuthenticationContext);

  const tryUserSignIn = useCallback(
    async (
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
    [
      router,
      updateAuthenticationContext,
      updateUserKey,
      authResponse,
      idToken,
      redirectPath,
    ],
  );

  const onSubmitSignInForm = useCallback(
    (
      data: UserSignInFormValues,
      setError: UseFormSetError<UserSignInFormValues>,
    ) => {
      tryUserSignIn(data.password, data.backupPassword).catch((e) => {
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
    [intl, tryUserSignIn],
  );

  return (
    <>
      <p>
        {authResponse.keyPair ? (
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
        showBackupPassword={authResponse.keyPair === null}
      />
    </>
  );
};

export default UserSignIn;
