import { encodeBase64Url } from "./base64";
import SymmetricKey from "./SymmetricKey";

type SerializedKeyPair = {
  privateKey: JsonWebKey;
  publicKey: JsonWebKey;
};

export default abstract class KeyPair extends SymmetricKey {
  public static AsymmetricKeyAlgorithm = "ECDH";
  private static AsymmetricKeyCurve = "P-521";

  public static GenerateAlgorithm: EcKeyGenParams = {
    name: KeyPair.AsymmetricKeyAlgorithm,
    namedCurve: KeyPair.AsymmetricKeyCurve,
  };

  public static ImportAlgorithm: EcKeyImportParams = {
    name: KeyPair.AsymmetricKeyAlgorithm,
    namedCurve: KeyPair.AsymmetricKeyCurve,
  };

  public static KeyUsages: KeyUsage[] = ["deriveKey"];

  protected crypto: SubtleCrypto;
  protected keyPair: CryptoKeyPair;
  protected saltPublicKey: CryptoKey;

  protected constructor(
    crypto: SubtleCrypto,
    keyPair: CryptoKeyPair,
    saltPublicKey: CryptoKey,
    derivedSymmetricKey: CryptoKey,
  ) {
    super(crypto, derivedSymmetricKey);

    this.crypto = crypto;
    this.keyPair = keyPair;
    this.saltPublicKey = saltPublicKey;
  }

  /**
   * Exports the public key of the key pair. Necessary to perform a Diffie-Hellman key exchange.
   * @returns The public key of the key pair
   */
  exportPublicKey(): Promise<JsonWebKey> {
    return this.crypto.exportKey("jwk", this.keyPair.publicKey);
  }

  /**
   * Exports the salt public key of the key pair.
   */
  exportSaltPublicKey(): Promise<JsonWebKey> {
    return this.crypto.exportKey("jwk", this.saltPublicKey);
  }

  /**
   * Exports the keypair in a serialized format but unprotected.
   * Never transmit this data over an insecure channel.
   */
  async exportUnprotected(): Promise<SerializedKeyPair> {
    const [privateKey, publicKey] = await Promise.all([
      this.crypto.exportKey("jwk", this.keyPair.privateKey),
      this.crypto.exportKey("jwk", this.keyPair.publicKey),
    ]);

    return { privateKey, publicKey };
  }

  static async importUnprotected(
    crypto: SubtleCrypto,
    {
      privateKey: serializedPrivateKey,
      publicKey: serializedPublicKey,
    }: SerializedKeyPair,
  ): Promise<CryptoKeyPair> {
    const [privateKey, publicKey] = await Promise.all([
      crypto.importKey(
        "jwk",
        serializedPrivateKey,
        KeyPair.ImportAlgorithm,
        true,
        KeyPair.KeyUsages,
      ),
      crypto.importKey(
        "jwk",
        serializedPublicKey,
        KeyPair.ImportAlgorithm,
        true,
        [],
      ),
    ]);

    return {
      privateKey,
      publicKey,
    };
  }

  /**
   * Computes a fingerprint of a JSON Web Key.
   */
  static async getJsonWebKeyKeyFingerprint(
    crypto: SubtleCrypto,
    key: JsonWebKey,
  ): Promise<string> {
    const digest = await crypto.digest(
      "SHA-512",
      new TextEncoder().encode(
        JSON.stringify(
          key,
          // sort the keys to ensure a consistent fingerprint
          Object.keys(key).toSorted(),
        ),
      ),
    );

    return encodeBase64Url(digest);
  }

  /**
   * Derives a key from based on a private key and a public key
   * using the ECDH algorithm.
   */
  static async deriveSymmetricKey(
    crypto: SubtleCrypto,
    privateKey: CryptoKey,
    publicKey: CryptoKey,
  ): Promise<CryptoKey> {
    return await crypto.deriveKey(
      { name: KeyPair.AsymmetricKeyAlgorithm, public: publicKey },
      privateKey,
      SymmetricKey.SymmetricDeriveAlgorithm,
      // do not allow the extraction of the derived key - it is ephemeral
      false,
      SymmetricKey.KeyUsages,
    );
  }

  /**
   * Generates a new, random public key.
   * This is used like a salt to derive a random symmetric key for a user.
   * This is necessary due to limitations in the WebCrypto API.
   * Specifically, we cannot derive a symmetric key directly from a ECDH key pair nor
   * can we directly use the private key to encrypt data.
   */
  static async generateRandomPublicKey(
    crypto: SubtleCrypto,
  ): Promise<CryptoKey> {
    const keyPair = await crypto.generateKey(KeyPair.GenerateAlgorithm, true, [
      "deriveKey",
    ]);

    return keyPair.publicKey;
  }
}
