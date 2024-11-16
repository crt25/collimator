import EphemeralKey from "./EphemeralKey";
import KeyPair from "./KeyPair";
import { PasswordDerivedKey } from "./PasswordDerivedKey";

export default class TeacherLongTermKeyPair extends KeyPair {
  static async create(
    crypto: SubtleCrypto,
    keyPair: CryptoKeyPair,
    saltPublicKey: CryptoKey,
  ): Promise<TeacherLongTermKeyPair> {
    // derive a symmetric key from the key pair - basically ECDH with ourselves
    const derivedSymmetricKey = await KeyPair.deriveSymmetricKey(
      crypto,
      keyPair.privateKey,
      saltPublicKey,
    );

    return new TeacherLongTermKeyPair(
      crypto,
      keyPair,
      saltPublicKey,
      derivedSymmetricKey,
    );
  }

  /**
   * Exports the long-term key in a (password-protected) format that can be stored server-side.
   * @param key The key used to encrypt the long-term key.
   * @returns The long-term key encrypted with the given key.
   */
  async exportPrivateKey(key: PasswordDerivedKey): Promise<Uint8Array> {
    const longTermKey = JSON.stringify(
      await this.crypto.exportKey("jwk", this.keyPair.privateKey),
    );

    return key.encryptString(longTermKey);
  }

  /**
   * Imports the long-term key from a (password-protected) format.
   * Note that after importing, the key cannot be extracted anymore.
   */
  static async importKeyPair(
    crypto: SubtleCrypto,
    encryptedLongTermPrivateKey: ArrayBuffer,
    plainTextPublicKey: JsonWebKey,
    plainSaltPublicKey: JsonWebKey,
    key: PasswordDerivedKey,
  ): Promise<TeacherLongTermKeyPair> {
    const longTermPrivateKey = JSON.parse(
      await key.decryptString(encryptedLongTermPrivateKey),
    );

    const privateKey = await crypto.importKey(
      "jwk",
      longTermPrivateKey,
      KeyPair.ImportAlgorithm,
      // we want to be able to extract the key for local temporary storage in the session
      true,
      KeyPair.KeyUsages,
    );

    const publicKey = await crypto.importKey(
      "jwk",
      plainTextPublicKey,
      KeyPair.ImportAlgorithm,
      // we want to be able to extract the key for local temporary storage in the session
      true,
      // do not pass any key usages as this is the public key
      [],
    );

    const saltPublicKey = await crypto.importKey(
      "jwk",
      plainSaltPublicKey,
      KeyPair.ImportAlgorithm,
      true,
      [],
    );

    return TeacherLongTermKeyPair.create(
      crypto,
      {
        privateKey,
        publicKey,
      },
      saltPublicKey,
    );
  }

  /**
   * Computes a fingerprint of the public key.
   * This fingerprint should be provided to the students together with the session link as
   * this will serve as a way to verify the authenticity of the teacher's public key.
   * Note that we assume the code running on the student's device is not compromised.
   * @returns The fingerprint of the public key
   */
  async getPublicKeyFingerprint(): Promise<string> {
    return KeyPair.getJsonWebKeyKeyFingerprint(
      this.crypto,
      await this.exportPublicKey(),
    );
  }

  /**
   * Derives a shared ephemeral key from the key pair and the public key of the other party.
   * By doing so, we finish the Diffie-Hellman key exchange and obtain a shared secret.
   */
  async deriveSharedEphemeralKey(
    studentPublicKey: JsonWebKey,
  ): Promise<EphemeralKey> {
    const publicKey = await this.crypto.importKey(
      "jwk",
      studentPublicKey,
      KeyPair.ImportAlgorithm,
      false,
      // do not pass any key usages as this is the public key
      [],
    );

    return new EphemeralKey(
      this.crypto,
      await KeyPair.deriveSymmetricKey(
        this.crypto,
        this.keyPair.privateKey,
        publicKey,
      ),
    );
  }

  /**
   * Generates a new, random long-term key for the teacher.
   * This key will be stored (password-protected) server-side
   * and is used to encrypt the student identities.
   * After a point in time where it is no longer necessary to track
   * a given student's identity, the key must be rotated.
   */
  static async generate(crypto: SubtleCrypto): Promise<TeacherLongTermKeyPair> {
    return TeacherLongTermKeyPair.create(
      crypto,
      await crypto.generateKey(
        KeyPair.GenerateAlgorithm,
        // we need the ability to export the key in order to store it locally
        true,
        KeyPair.KeyUsages,
      ),
      await KeyPair.generateRandomPublicKey(crypto),
    );
  }
}
