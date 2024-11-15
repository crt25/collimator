import { Injectable } from "@nestjs/common";
import { User, Prisma, KeyPair } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { UserId } from "./dto";
import { CreateKeyPairDto } from "./dto/create-key-pair.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByIdOrThrow(id: UserId): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  findMany(args?: Prisma.UserFindManyArgs): Promise<User[]> {
    return this.prisma.user.findMany(args);
  }

  create(user: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data: user });
  }

  update(id: UserId, user: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      data: user,
      where: { id },
    });
  }

  async updateTeacherKey(
    userId: UserId,
    teacherKey: CreateKeyPairDto,
  ): Promise<KeyPair> {
    const publicKey = Buffer.from(teacherKey.publicKey, "utf-8");

    const privateKeys = teacherKey.privateKeys.map((privateKey) => ({
      encryptedPrivateKey: Buffer.from(
        privateKey.encryptedPrivateKey,
        "base64",
      ),
      salt: Buffer.from(privateKey.salt, "base64"),
    }));

    // Delete all private keys for this teacher
    await this.prisma.encryptedPrivateKey.deleteMany({
      where: { publicKey: { teacherId: userId } },
    });

    // Update the public key and add the new private keys

    return await this.prisma.keyPair.upsert({
      create: {
        publicKey,
        publicKeyFingerprint: teacherKey.publicKeyFingerprint,
        privateKeys: {
          create: privateKeys,
        },
        teacherId: userId,
      },
      update: {
        publicKey,
        publicKeyFingerprint: teacherKey.publicKeyFingerprint,
        privateKeys: {
          create: privateKeys,
        },
      },
      where: { teacherId: userId },
    });
  }

  deleteById(id: UserId): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
