import { webcrypto, subtle } from "crypto";
const crypto = subtle;

export const getPublicKeyFingerprint = async (
  publicKey: webcrypto.JsonWebKey,
): Promise<string> =>
  Buffer.from(
    await crypto.digest(
      "SHA-512",
      new TextEncoder().encode(publicKey["x"] + "@" + publicKey["y"]),
    ),
  ).toString("base64url");

const adminPublicKey: webcrypto.JsonWebKey = {
  key_ops: [],
  ext: true,
  kty: "EC",
  x: "AXS_uWZbEN-rcP0ayjHwV4kdtkYeEScV4A__6vyaCPki-sL1l5R_XfmBOzUt-tJPlYt1SY4TNwf4z2GBwS6JTNtD",
  y: "AZOo3pXHGztHBkmiFgzKBhSLSiqlG-GsUw97Hv_SWefoaBSz3piIw-9vKnqkpNYKpwjGDEnShO6cJBoDfHQylSGi",
  crv: "P-521",
};

const adminPrivateKey: webcrypto.JsonWebKey = {
  ...adminPublicKey,
  key_ops: ["deriveKey"],
  d: "Afi3NZX8Bn_tAmuYRdyoPnK4Rsqu11ef3K6DpZTKio7dMBR3NyPI9FZNKlOJDb1J_RbV9QxXejCqUvaFIbMKdQD0",
};

export const adminUser = {
  id: 10_000,
  oidcSub: "1234",
  email: "jane@doe.com",
  name: "Jane Doe",
  type: "ADMIN" as const,
  authenticationProvider: "MICROSOFT" as const,
  passwords: ["hunter2", "toor"],
  publicKey: adminPublicKey,
  privateKey: adminPrivateKey,
};

export const newTeacher = {
  id: 10_001,
  oidcSub: "5678",
  email: "richard@feynman.com",
  name: "Richard Feynman",
  type: "TEACHER" as const,
  authenticationProvider: "MICROSOFT" as const,
  registrationToken: "123-456-789",
};

export const registeredUsers = [adminUser];
export const unregisteredUsers = [newTeacher];
