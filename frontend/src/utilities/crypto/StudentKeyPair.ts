import EphemeralKey from "./EphemeralKey";
import KeyPair from "./KeyPair";
import SymmetricKey from "./SymmetricKey";

export default class StudentKeyPair extends KeyPair {
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
        SymmetricKey.DeriveAlgorithm,
        // do not allow the extraction of the derived key - it is ephemeral
        false,
        SymmetricKey.KeyUsages,
      ),
    );
  }

  static async generate(crypto: SubtleCrypto): Promise<StudentKeyPair> {
    return new StudentKeyPair(
      crypto,
      await crypto.generateKey(
        KeyPair.GenerateAlgorithm,
        // we need the ability to export the key in order to store it locally
        true,
        KeyPair.KeyUsages,
      ),
    );
  }
}