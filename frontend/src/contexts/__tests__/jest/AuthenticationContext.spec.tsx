import {
  AuthenticationContextType,
  deserializeAuthenticationContext,
  isStudentLocallyAuthenticated,
  serializeAuthenticationContext,
} from "@/contexts/AuthenticationContext";
import KeyPair from "@/utilities/crypto/KeyPair";
import { subtle } from "crypto";
import {
  getAuthenticatedAdminContext,
  getAuthenticatedTeacherContext,
  getFullyAuthenticatedStudentContext,
  getLocallyAuthenticatedStudentContext,
  getUnauthenticatedContext,
} from "../mock-contexts";
import { UserRole } from "@/types/user/user-role";

const crypto = subtle as SubtleCrypto;

describe("AuthenticationContext", () => {
  describe("isStudentLocallyAuthenticated", () => {
    it("should return true if the user is authenticated as student (locally)", async () => {
      const authContext = await getLocallyAuthenticatedStudentContext();
      const isAuthenticated = isStudentLocallyAuthenticated(authContext);

      expect(isAuthenticated).toBe(true);
    });

    it.each([
      ["nobody", getUnauthenticatedContext],
      ["student (fully)", getFullyAuthenticatedStudentContext],
      ["teacher", getAuthenticatedTeacherContext],
      ["admin", getAuthenticatedAdminContext(UserRole.admin)],
    ])(
      "should return false if the student is fully authenticated",
      async (_, getContext) => {
        const authContext = await getContext(crypto);
        const isAuthenticated = isStudentLocallyAuthenticated(authContext);

        expect(isAuthenticated).toBe(false);
      },
    );
  });

  describe("serializeAuthenticationContext & deserializeAuthenticationContext", () => {
    it.each([
      ["nobody", getUnauthenticatedContext],
      ["student (locally)", getLocallyAuthenticatedStudentContext],
      ["admin", getAuthenticatedAdminContext(UserRole.admin)],
    ])(
      "can (de-)serialize an context in which the user is authenticated as %s",
      async (_, getContext) => {
        const authContext = await getContext(crypto);
        const serialized = JSON.stringify(
          await serializeAuthenticationContext(crypto, authContext),
        );

        const deserialized = await deserializeAuthenticationContext(
          crypto,
          JSON.parse(serialized),
        );

        expect(deserialized).toEqual(authContext);
      },
    );

    it.each([
      ["teacher", getAuthenticatedTeacherContext],
      ["student (fully)", getFullyAuthenticatedStudentContext],
    ])(
      "can (de-)serialize an context in which the user is authenticated as %s",
      async (_, getContext) => {
        const authContext = await getContext(crypto);

        if (!("keyPair" in authContext)) {
          throw new Error("keyPair is not in the context");
        }

        const serialized = JSON.stringify(
          await serializeAuthenticationContext(crypto, authContext),
        );

        const deserializedContext = await deserializeAuthenticationContext(
          crypto,
          JSON.parse(serialized),
        );

        expect(deserializedContext).toEqual({
          ...authContext,
          // the keyPair object will not be equal
          keyPair: expect.any(KeyPair),
        });

        // check the keyPair object is equivalent

        const keyPair1 = await authContext.keyPair.exportUnprotected();
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
