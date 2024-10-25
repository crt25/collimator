export default abstract class SymmetricKey {
  // we use AES in Galois/Counter Mode (GCM) for symmetric encryption with integrity protection
  private static SymmetricKeyAlgorithm = "AES-GCM";

  // maximum key size for AES is 256 bits = 32 bytes
  // see https://developer.mozilla.org/en-US/docs/Web/API/AesKeyGenParams#length
  private static SymmetricKeySize = 256;

  // recommended size for the IV is 96 bits = 12 bytes
  // https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams#iv
  private static IVSize = 12;

  // recommended size for the tag length is 128
  // https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams#taglength
  private static TagLength = 128;

  public static KeyUsages: KeyUsage[] = ["encrypt", "decrypt"];

  public static GenerateAlgorithm: AesKeyGenParams = {
    name: SymmetricKey.SymmetricKeyAlgorithm,
    length: SymmetricKey.SymmetricKeySize,
  };

  public static ImportAlgorithm: AesKeyAlgorithm = {
    name: SymmetricKey.SymmetricKeyAlgorithm,
    length: SymmetricKey.SymmetricKeySize,
  };

  public static DeriveAlgorithm: AesDerivedKeyParams = {
    name: SymmetricKey.SymmetricKeyAlgorithm,
    length: SymmetricKey.SymmetricKeySize,
  };

  protected crypto: SubtleCrypto;
  protected key: CryptoKey;

  constructor(crypto: SubtleCrypto, key: CryptoKey) {
    this.crypto = crypto;
    this.key = key;
  }

  /**
   * Encrypts the given data with the ephemeral key.
   * The IV is generated randomly and prepended to the ciphertext.
   * The additional data is authenticated but not encrypted.
   * On top of being confidential, the returned ciphertext is also authenticated.
   * The additional data is not part of the ciphertext but is authenticated and must be provided during decryption.
   */
  async encrypt(
    data: BufferSource,
    additionalData?: BufferSource,
  ): Promise<Uint8Array> {
    const iv = crypto.getRandomValues(new Uint8Array(SymmetricKey.IVSize));
    const ciphertext = await this.crypto.encrypt(
      {
        name: SymmetricKey.SymmetricKeyAlgorithm,
        iv,
        additionalData,
        tagLength: SymmetricKey.TagLength,
      },
      this.key,
      data,
    );

    const concatenated = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    concatenated.set(iv, 0);
    concatenated.set(new Uint8Array(ciphertext), iv.byteLength);

    return concatenated;
  }

  /**
   * Encrypts the given string with the ephemeral key.
   * The IV is generated randomly and prepended to the ciphertext.
   * The additional data is authenticated but not encrypted.
   * On top of being confidential, the returned ciphertext is also authenticated.
   * The additional data is not part of the ciphertext but is authenticated and must be provided during decryption.
   */
  async encryptString(
    data: string,
    additionalData?: BufferSource,
  ): Promise<Uint8Array> {
    return this.encrypt(new TextEncoder().encode(data), additionalData);
  }

  /**
   * Decrypts the given data with the ephemeral key.
   * The IV is expected to be prepended to the ciphertext.
   * The additional data is also authenticated meaning if it does not match the one used during encryption, the decryption will fail.
   */
  decrypt(
    data: Uint8Array,
    additionalData?: BufferSource,
  ): Promise<ArrayBuffer> {
    const iv = data.slice(0, SymmetricKey.IVSize);
    const ciphertext = data.slice(SymmetricKey.IVSize);

    return this.crypto.decrypt(
      {
        name: SymmetricKey.SymmetricKeyAlgorithm,
        iv,
        additionalData,
        tagLength: SymmetricKey.TagLength,
      },
      this.key,
      ciphertext,
    );
  }

  /**
   * Decrypts the given string with the ephemeral key.
   * The IV is expected to be prepended to the ciphertext.
   * The additional data is also authenticated meaning if it does not match the one used during encryption, the decryption will fail.
   */
  async decryptString(
    data: Uint8Array,
    additionalData?: BufferSource,
  ): Promise<string> {
    return new TextDecoder().decode(await this.decrypt(data, additionalData));
  }
}
