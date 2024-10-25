import {
  AuthenticationContextType,
  deserializeAuthenticationContext,
  isStudentLocallyAuthenticated,
  serializeAuthenticationContext,
} from "@/contexts/AuthenticationContext";
import { UserRole } from "@/i18n/user-role-messages";
import KeyPair from "@/utilities/crypto/KeyPair";
import { subtle } from "crypto";
import {
  getAuthenticatedNonStudentTeacherContext,
  getAuthenticatedTeacherContext,
  getFullyAuthenticatedStudentContext,
  getLocallyAuthenticatedStudentContext,
  getUnauthenticatedContext,
} from "../mock-contexts";

const crypto = subtle as SubtleCrypto;

describe("AuthenticationContext", () => {
  describe("isStudentLocallyAuthenticated", () => {
    it.each([["student (locally)", getLocallyAuthenticatedStudentContext]])(
      "should return true if the user is authenticated as %s",
      async (_, getContext) => {
        expect(isStudentLocallyAuthenticated(await getContext())).toBe(true);
      },
    );

    it.each([
      ["nobody", getUnauthenticatedContext],
      ["student (fully)", getFullyAuthenticatedStudentContext],
      ["teacher", getAuthenticatedTeacherContext],
      ["admin", getAuthenticatedNonStudentTeacherContext(UserRole.admin)],
    ])(
      "should return false if the student is fully authenticated",
      async (_, getContext) => {
        expect(isStudentLocallyAuthenticated(await getContext(crypto))).toBe(
          false,
        );
      },
    );
  });

  describe("serializeAuthenticationContext & deserializeAuthenticationContext", () => {
    it.each([
      ["nobody", getUnauthenticatedContext],
      ["student (locally)", getLocallyAuthenticatedStudentContext],
      ["admin", getAuthenticatedNonStudentTeacherContext(UserRole.admin)],
    ])(
      "can (de-)serialize an context in which the user is authenticated as %s",
      async (_, getContext) => {
        const context = await getContext();
        const serialized = JSON.stringify(
          await serializeAuthenticationContext(context),
        );

        const deserialized = await deserializeAuthenticationContext(
          crypto,
          JSON.parse(serialized),
        );

        expect(deserialized).toEqual(context);
      },
    );

    it.each([
      ["teacher", getAuthenticatedTeacherContext],
      ["student (fully)", getFullyAuthenticatedStudentContext],
    ])(
      "can (de-)serialize an context in which the user is authenticated as %s",
      async (_, getContext) => {
        const context = await getContext(crypto);

        if (!("keyPair" in context)) {
          throw new Error("keyPair is not in the context");
        }

        const serialized = JSON.stringify(
          await serializeAuthenticationContext(context),
        );

        const deserializedContext = await deserializeAuthenticationContext(
          crypto,
          JSON.parse(serialized),
        );

        expect(deserializedContext).toEqual({
          ...context,
          // the keyPair object will not be equal
          keyPair: expect.any(KeyPair),
        });

        // check the keyPair object is equivalent

        const keyPair1 = await context.keyPair.exportUnprotected();
        const keyPair2 = await (
          deserializedContext as AuthenticationContextType & {
            keyPair: KeyPair;
          }
        ).keyPair.exportUnprotected();

        expect(keyPair1).toEqual(keyPair2);
      },
    );
  });
});
