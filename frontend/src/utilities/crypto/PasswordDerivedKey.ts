import SymmetricKey from "./SymmetricKey";

export class PasswordDerivedKey extends SymmetricKey {
  /**
   * Deterministically derives a key from a password.
   * Note that the salt must be the same in order to derive the same key and should
   * be user specific. However, it is not necessary to keep the salt secret.
   * @param crypto The SubtleCrypto instance
   * @param password The password to derive the key from
   * @param salt The salt to use for the derivation. Must be at least 128 bits = 16 bytes according to NIST, see https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf
   */
  static async derive(
    crypto: SubtleCrypto,
    password: string,
    salt: BufferSource,
  ): Promise<PasswordDerivedKey> {
    if (salt.byteLength < 16) {
      throw new Error("The salt must be at least 16 bytes long");
    }

    // import the password as a key
    const passwordKey = await crypto.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      // we never want to export this again
      false,
      // we will only use it for deriving keys
      ["deriveKey"],
    );

    // then deterministically derive a key from the password
    const derivedKey = await crypto.deriveKey(
      {
        name: "PBKDF2",
        salt,
        // OWASP recommends at least 210,000 iterations (as of October 2024)
        // see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
        iterations: 250_000,
        hash: "SHA-512",
      },
      passwordKey,
      SymmetricKey.DeriveAlgorithm,
      // we never want to export this again, the key will be re-derived instead
      false,
      SymmetricKey.KeyUsages,
    );

    return new PasswordDerivedKey(crypto, derivedKey);
  }
}
