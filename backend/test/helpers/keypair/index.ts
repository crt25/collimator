import { INestApplication } from "@nestjs/common";
import { EncryptedPrivateKey, KeyPair } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

export const createKeyPair = async (
  app: INestApplication,
  options: {
    id: number;
    teacherId: number;
  },
): Promise<KeyPair> => {
  const prisma = app.get(PrismaService);

  return prisma.keyPair.create({
    data: {
      id: options.id,
      teacherId: options.teacherId,
      publicKey: Buffer.from("public-key"),
      publicKeyFingerprint: `fingerprint-${options.id}`,
      salt: Buffer.from("salt"),
    },
  });
};

export const createEncryptedPrivateKey = async (
  app: INestApplication,
  options: {
    id: number;
    publicKeyId: number;
  },
): Promise<EncryptedPrivateKey> => {
  const prisma = app.get(PrismaService);

  return prisma.encryptedPrivateKey.create({
    data: {
      id: options.id,
      publicKeyId: options.publicKeyId,
      encryptedPrivateKey: Buffer.from("encrypted-private-key"),
      salt: Buffer.from("salt"),
    },
  });
};
