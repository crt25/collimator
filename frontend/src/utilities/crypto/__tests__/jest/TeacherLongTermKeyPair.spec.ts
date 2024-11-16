import { subtle } from "crypto";
import TeacherLongTermKeyPair from "../../TeacherLongTermKeyPair";
import { PasswordDerivedKey } from "../../PasswordDerivedKey";

const crypto = subtle as SubtleCrypto;
const password = "hunter2";
const salt = new Uint8Array(16).fill(5);

const generateKeyPair = (): Promise<TeacherLongTermKeyPair> =>
  TeacherLongTermKeyPair.generate(crypto);

describe("TeacherKeyPair", () => {
  describe("generateTeacherKeyPair", () => {
    it("generates a key pair", async () => {
      await expect(generateKeyPair()).resolves.not.toThrow();
    });
  });

  describe("getPublicKeyFingerprint", () => {
    it("computes a deterministic fingerprint of the public key", async () => {
      const keyPair = await generateKeyPair();
      const fingerprint = await keyPair.getPublicKeyFingerprint();

      expect(fingerprint).toBeDefined();

      // ensure the fingerprint is deterministic
      const fingerprint2 = await keyPair.getPublicKeyFingerprint();

      expect(fingerprint2).toEqual(fingerprint);
    });
  });

  describe("export and import", () => {
    it("can export and import the keypair in a password-protected way", async () => {
      const keyPair1 = await generateKeyPair();
      const keyPair2 = await generateKeyPair();
      const passwordKey = await PasswordDerivedKey.derive(
        crypto,
        password,
        salt,
      );

      const publicKey1 = await keyPair1.exportPublicKey();
      const saltPublicKey1 = await keyPair1.exportSaltPublicKey();

      const publicKey2 = await keyPair2.exportPublicKey();

      const ephemeralKey1 = await keyPair1.deriveSharedEphemeralKey(publicKey2);

      const plainText = new Uint8Array([1, 2, 3, 4, 5]);
      const cipherText = await ephemeralKey1.encrypt(plainText);

      const exportedPrivateKey1 = await keyPair1.exportPrivateKey(passwordKey);
      const imported = await TeacherLongTermKeyPair.importKeyPair(
        crypto,
        exportedPrivateKey1,
        publicKey1,
        saltPublicKey1,
        passwordKey,
      );

      // check if we can derive the same shared key
      const ephemeralKey2 = await imported.deriveSharedEphemeralKey(publicKey2);

      // test to ensure the imported key can decrypt the ciphertext
      const decrypted = new Uint8Array(await ephemeralKey2.decrypt(cipherText));
      expect(decrypted).toEqual(plainText);
    });
  });
});
