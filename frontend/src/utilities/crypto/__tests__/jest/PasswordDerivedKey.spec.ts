import { subtle } from "crypto";
import { PasswordDerivedKey } from "../../PasswordDerivedKey";

const crypto = subtle as SubtleCrypto;
const password = "hunter2";
const salt = new Uint8Array(16).fill(5);

describe("PasswordDerivedKey", () => {
  it("should derive a key from a password", async () => {
    const key = await PasswordDerivedKey.derive(crypto, password, salt);

    expect(key).toBeInstanceOf(PasswordDerivedKey);
  });

  it("derivation fails with a weak salt", async () => {
    await expect(
      PasswordDerivedKey.derive(crypto, password, new Uint8Array(2)),
    ).rejects.toThrow();
  });

  describe("encrypt and decrypt", () => {
    it("can encrypt and decrypt a binary message", async () => {
      const key = await PasswordDerivedKey.derive(crypto, password, salt);
      const plainText = new Uint8Array([1, 2, 3, 4, 5]);
      const cipherText1 = await key.encrypt(plainText);
      const cipherText2 = await key.encrypt(plainText);

      // dummy test to ensure the encryption is not a no-op
      expect(cipherText1).not.toEqual(plainText);
      expect(cipherText2).not.toEqual(plainText);

      // encryption must be randomized to be secure under IND-CPA
      expect(cipherText1).not.toEqual(cipherText2);

      // decryption must return the original plaintext
      const decrypted = new Uint8Array(await key.decrypt(cipherText1));
      expect(decrypted).toEqual(plainText);
    });

    it("can encrypt and decrypt a string", async () => {
      const key = await PasswordDerivedKey.derive(crypto, password, salt);
      const plainText = JSON.stringify({
        some: "content",
        that: {
          has: [{ nested: "values" }],
        },
      });

      const cipherText1 = await key.encryptString(plainText);
      const cipherText2 = await key.encryptString(plainText);

      // dummy test to ensure the encryption is not a no-op
      expect(cipherText1).not.toEqual(plainText);
      expect(cipherText2).not.toEqual(plainText);

      // encryption must be randomized to be secure under IND-CPA
      expect(cipherText1).not.toEqual(cipherText2);

      // decryption must return the original plaintext
      const decrypted = await key.decryptString(cipherText1);
      expect(decrypted).toEqual(plainText);
    });

    it("can decrypt a message if the key is derived twice with the same password and salt", async () => {
      const encryptionKey = await PasswordDerivedKey.derive(
        crypto,
        password,
        salt,
      );
      const decryptionKey = await PasswordDerivedKey.derive(
        crypto,
        password,
        salt,
      );
      const plainText = new Uint8Array([1, 2, 3, 4, 5]);
      const cipherText = await encryptionKey.encrypt(plainText);

      // decryption must return the original plaintext
      const decrypted = new Uint8Array(await decryptionKey.decrypt(cipherText));
      expect(decrypted).toEqual(plainText);
    });

    it("cannot decrypt a message if the decryption key is derived with a different salt", async () => {
      const encryptionKey = await PasswordDerivedKey.derive(
        crypto,
        password,
        salt,
      );
      const decryptionKey = await PasswordDerivedKey.derive(
        crypto,
        password,
        new Uint8Array(16).fill(6),
      );
      const plainText = new Uint8Array([1, 2, 3, 4, 5]);

      const cipherText = await encryptionKey.encrypt(plainText);
      await expect(decryptionKey.decrypt(cipherText)).rejects.toThrow();
    });

    it("cannot decrypt a message if the decryption key is derived twice with a different password", async () => {
      const encryptionKey = await PasswordDerivedKey.derive(
        crypto,
        password,
        salt,
      );
      const decryptionKey = await PasswordDerivedKey.derive(
        crypto,
        "hunter1",
        salt,
      );
      const plainText = new Uint8Array([1, 2, 3, 4, 5]);

      const cipherText = await encryptionKey.encrypt(plainText);
      await expect(decryptionKey.decrypt(cipherText)).rejects.toThrow();
    });
  });
});
