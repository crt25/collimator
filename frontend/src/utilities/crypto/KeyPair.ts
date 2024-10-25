type SerializedKeyPair = {
  privateKey: JsonWebKey;
  publicKey: JsonWebKey;
};

export default abstract class KeyPair {
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

  constructor(crypto: SubtleCrypto, keyPair: CryptoKeyPair) {
    this.crypto = crypto;
    this.keyPair = keyPair;
  }

  /**
   * Exports the public key of the key pair. Necessary to perform a Diffie-Hellman key exchange.
   * @returns The public key of the key pair
   */
  exportPublicKey(): Promise<JsonWebKey> {
    return this.crypto.exportKey("jwk", this.keyPair.publicKey);
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
      new TextEncoder().encode(JSON.stringify(key)),
    );

    return btoa(
      Array.from(new Uint8Array(digest))
        .map((byte) => String.fromCharCode(byte).toString())
        .join(""),
    );
  }
}
