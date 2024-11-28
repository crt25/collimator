import EphemeralKey from "./EphemeralKey";
import KeyPair from "./KeyPair";
import SymmetricKey from "./SymmetricKey";

export default class StudentKeyPair extends KeyPair {
  static async create(
    crypto: SubtleCrypto,
    keyPair: CryptoKeyPair,
    saltPublicKey: CryptoKey,
  ): Promise<StudentKeyPair> {
    /**
     * Derive a symmetric key from the key pair - basically ECDH with ourselves
     * This is due to limitations in the WebCrypto API where we cannot directly derive a symmetric key
     * from a ECDH key pair. (November 2024)
     */
    const derivedSymmetricKey = await KeyPair.deriveSymmetricKey(
      crypto,
      keyPair.privateKey,
      saltPublicKey,
    );

    return new StudentKeyPair(
      crypto,
      keyPair,
      saltPublicKey,
      derivedSymmetricKey,
    );
  }

  /**
   * Derives a shared ephemeral key from the key pair and the public key of the other party.
   * By doing so, we finish the Diffie-Hellman key exchange and obtain a shared secret.
   */
  async deriveSharedEphemeralKey(
    teacherPublicKey: JsonWebKey,
    expectedFingerprint: string,
  ): Promise<EphemeralKey> {
    // verify the fingerprint against the public key
    const fingerprint = await KeyPair.getJsonWebKeyKeyFingerprint(
      this.crypto,
      teacherPublicKey,
    );

    if (fingerprint !== expectedFingerprint) {
      throw new Error("The fingerprint does not match the public key.");
    }

    const publicKey = await this.crypto.importKey(
      "jwk",
      teacherPublicKey,
      KeyPair.ImportAlgorithm,
      false,
      // do not pass any key usages as this is the public key
      [],
    );

    return new EphemeralKey(
      this.crypto,
      await this.crypto.deriveKey(
        { name: KeyPair.AsymmetricKeyAlgorithm, public: publicKey },
        this.keyPair.privateKey,
        SymmetricKey.SymmetricDeriveAlgorithm,
        // do not allow the extraction of the derived key - it is ephemeral
        false,
        SymmetricKey.KeyUsages,
      ),
    );
  }

  static async generate(crypto: SubtleCrypto): Promise<StudentKeyPair> {
    return StudentKeyPair.create(
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
