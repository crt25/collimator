import { PrismaClient } from "@prisma/client";
import {
  getPublicKeyFingerprint,
  registeredUsers,
  unregisteredUsers,
} from "@e2e-data/user";
import { getRandomValues, randomBytes, subtle } from "crypto";
const crypto = subtle;

const symmetricKeyAlgo = "AES-GCM";

const ivSize = 12;
const tagLength = 128;
const PBKDF2Iterations = 250_000;

// testing data does not need to be secure - we can reuse the same salt for all users
const salt = randomBytes(32);

export const createUsers = async (prisma: PrismaClient): Promise<void> => {
  await Promise.all([
    ...registeredUsers.map(async (user) => {
      const privateKey = new TextEncoder().encode(
        JSON.stringify(user.privateKey),
      );
      const publicKey = JSON.stringify(user.publicKey);
      const publicKeyFingerprint = await getPublicKeyFingerprint(
        user.publicKey,
      );

      const privateKeyData = user.passwords.map(async (password) => {
        const passwordKey = await crypto.importKey(
          "raw",
          new TextEncoder().encode(password),
          "PBKDF2",
          false,
          ["deriveKey"],
        );

        const derivedKey = await crypto.deriveKey(
          {
            name: "PBKDF2",
            salt,
            iterations: PBKDF2Iterations,
            hash: "SHA-512",
          },
          passwordKey,
          {
            name: "AES-GCM",
            length: 256,
          },
          false,
          ["encrypt", "decrypt"],
        );

        const iv = getRandomValues(new Uint8Array(ivSize));
        const ciphertext = await crypto.encrypt(
          {
            name: symmetricKeyAlgo,
            iv,
            tagLength,
          },
          derivedKey,
          privateKey,
        );

        const concatenated = new Uint8Array(
          iv.byteLength + ciphertext.byteLength,
        );
        concatenated.set(iv, 0);
        concatenated.set(new Uint8Array(ciphertext), iv.byteLength);

        return {
          encryptedPrivateKey: Buffer.from(concatenated),
          salt,
        };
      });

      // generate another random public private key pair
      const saltKeyPair = await crypto.generateKey(
        {
          name: "ECDH",
          namedCurve: "P-521",
        },
        true,
        ["deriveKey"],
      );

      // export the public key and store it as the salt
      const saltPublicKey = JSON.stringify(
        await crypto.exportKey("jwk", saltKeyPair.publicKey),
      );

      return prisma.user.create({
        data: {
          oidcSub: user.oidcSub,
          email: user.email,
          name: user.name,
          type: user.type,
          authenticationProvider: user.authenticationProvider,
          keyPair: {
            create: {
              publicKey: Buffer.from(publicKey, "utf-8"),
              publicKeyFingerprint,
              salt: Buffer.from(saltPublicKey, "utf-8"),
              privateKeys: {
                createMany: {
                  data: await Promise.all(privateKeyData),
                },
              },
            },
          },
        },
      });
    }),
    ...unregisteredUsers.map((user) =>
      prisma.user.create({
        data: {
          oidcSub: user.oidcSub,
          email: user.email,
          name: user.name,
          type: user.type,
          authenticationProvider: user.authenticationProvider,
          registrationToken: {
            create: {
              token: user.registrationToken,
            },
          },
        },
      }),
    ),
  ]);
};
