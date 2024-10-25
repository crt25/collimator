import { subtle, webcrypto } from "crypto";

export const issuer = "http://localhost:3000/issuer";
export const sub = "1234567890";

export const generateKey = async (): Promise<
  [webcrypto.CryptoKeyPair, webcrypto.JsonWebKey]
> => {
  const keyPair = await subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"],
  );

  // export public key to JWK
  const publicKey = await subtle.exportKey("jwk", keyPair.publicKey);

  return [keyPair, publicKey];
};

export const generateJwt = async (
  keyPair: webcrypto.CryptoKeyPair,
  clientId: string,
  nonce: string,
): Promise<string> => {
  const publicKey = await subtle.exportKey("jwk", keyPair.publicKey);

  // create a mock open id connect id token
  const idToken = {
    iss: issuer,
    sub,
    aud: clientId,
    exp: Date.now() + 60 * 60 * 1000,
    iat: Date.now(),
    email: "john@doe.com",
    nonce,
  };

  const jwtHeader = Buffer.from(
    JSON.stringify({
      typ: "JWT",
      alg: "ES256",
      jwk: publicKey,
    }),
  ).toString("base64url");

  const jwtPayload = Buffer.from(JSON.stringify(idToken)).toString("base64url");

  const data = new TextEncoder().encode(jwtHeader + "." + jwtPayload);

  // sign the id token
  const signature = await subtle.sign(
    {
      name: "ECDSA",
      hash: "SHA-256",
    },
    keyPair.privateKey,
    data,
  );

  const stringSignature = Buffer.from(new Uint8Array(signature)).toString(
    "base64url",
  );

  const jwt = jwtHeader + "." + jwtPayload + "." + stringSignature;

  return jwt;
};
